import {
  cancelAssistantSpeechSession,
  createAssistantSpeechStreamReservation,
  getAssistantSpeechSession,
  type AssistantChatStreamEvent,
  type AssistantInteractionScope,
  type AssistantSpeechCapabilities,
  type AssistantSpeechMotionCue,
  type AssistantSpeechRequest,
  type AssistantSpeechServerControl,
  type AssistantSpeechSession,
  type AssistantSpeechStreamReservationResponse,
  type AssistantSpeechTimeline,
  type AssistantSpeechVisemeCue,
  type SpeechTimelineRequest
} from "@/api/frontend/assistant";

export type SpeechPlaybackState =
  | "disabled"
  | "preparing"
  | "connecting"
  | "streaming"
  | "finalizing"
  | "ready"
  | "playing"
  | "paused"
  | "cancelled"
  | "failed"
  | "unavailable";

export interface SpeechPlaybackDiagnostic {
  pipelineMode?: string;
  textTtsParallel?: boolean;
  commandProtocol?: string;
  timelineClock?: string;
  recoveryEnabled?: boolean;
  durableArchiveEnabled?: boolean;
  streamId?: string;
  sessionId?: string;
  phase?: string;
  serverEvent?: string;
  clientEvent?: string;
  eventSequence?: number;
  segmentSequence?: number;
  audioSequence?: number;
  playedSample?: number;
  bufferedMs?: number;
  peakRms?: number;
  audioContextState?: AudioContextState;
  websocketCloseCode?: number;
  websocketCloseReason?: string;
  websocketWasClean?: boolean;
  sessionStatus?: string;
  liveDeliveryStatus?: string;
  archiveStatus?: string;
  terminalEvent?: string;
  archiveDisposition?: string;
  lastAudioSequence?: number;
  audioSampleCount?: number;
  relayedSampleCount?: number;
  lastPlayedSample?: number;
  archiveResumeMs?: number;
  pollAfterMs?: number;
  errorCode?: string;
}

export interface SpeechRendererAdapter {
  setState(
    state: "idle" | "listening" | "thinking" | "speaking" | "error"
  ): void;
  setAmplitude(value: number): void;
  applyViseme(id: string, weight: number): void;
  triggerMotion(key: string, durationMs: number, targetRef?: string): void;
  reset(): void;
}

interface SpeechControllerCallbacks {
  renderer: SpeechRendererAdapter;
  onStatus?: (state: SpeechPlaybackState, message?: string) => void;
  onSession?: (
    clientMessageId: string | number,
    session: AssistantSpeechSession,
    playbackState: SpeechPlaybackState
  ) => void;
  onDiagnostic?: (diagnostic: SpeechPlaybackDiagnostic) => void;
}

interface PrepareSpeechContext {
  conversationId?: string;
  courseId?: number;
  targetStudentId?: number;
  interactionScope?: AssistantInteractionScope;
  voiceAlias?: string;
}

interface ParsedA3AUFrame {
  sequence: number;
  startSample: number;
  sampleCount: number;
  discontinuity: boolean;
  pcm: Int16Array;
}

const RUNNING_STATUSES = new Set([
  "reserved",
  "connecting",
  "streaming",
  "finalizing",
  "queued",
  "synthesizing",
  "retrying",
  "cancel_requested"
]);
const READY_STATUSES = new Set(["ready", "ready_degraded"]);
const VALID_VISEMES = new Set(["sil", "aa", "ih", "ou", "ee", "oh"]);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const delay = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });

export function parseA3AUFrame(buffer: ArrayBuffer): ParsedA3AUFrame {
  if (buffer.byteLength < 24) throw new Error("a3au_header_truncated");
  const view = new DataView(buffer);
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (magic !== "A3AU") throw new Error("a3au_magic_invalid");
  if (view.getUint8(4) !== 1) throw new Error("a3au_version_unsupported");
  if (view.getUint8(5) !== 1) throw new Error("a3au_codec_unsupported");
  if (view.getUint8(6) !== 1) throw new Error("a3au_channels_unsupported");

  const sequence = view.getUint32(8, false);
  const startSample =
    view.getUint32(12, false) * 0x100000000 + view.getUint32(16, false);
  const sampleCount = view.getUint32(20, false);
  if (
    sequence === 0 ||
    sampleCount === 0 ||
    buffer.byteLength !== 24 + sampleCount * 2
  ) {
    throw new Error("a3au_length_invalid");
  }

  const pcm = new Int16Array(sampleCount);
  for (let index = 0; index < sampleCount; index += 1) {
    pcm[index] = view.getInt16(24 + index * 2, true);
  }
  return {
    sequence,
    startSample,
    sampleCount,
    discontinuity: (view.getUint8(7) & 1) !== 0,
    pcm
  };
}

export class SpeechPlaybackController {
  private capabilities: AssistantSpeechCapabilities | null = null;
  private readonly callbacks: SpeechControllerCallbacks;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private workletModuleLoaded = false;
  private workletModulePromise: Promise<void> | null = null;
  private websocket: WebSocket | null = null;
  private realtimeStreamId = "";
  private realtimeSessionId = "";
  private realtimeSampleRate = 24000;
  private lastAudioSequence = 0;
  private lastServerEventSequence = 0;
  private playedSample = 0;
  private bufferedMs = 0;
  private peakRms = 0;
  private lastProgressSentAt = 0;
  private liveStarted = false;
  private liveFailed = false;
  private liveTerminalReceived = false;
  private liveArchiveStatus = "";
  private timeline: AssistantSpeechTimeline | null = null;
  private currentViseme = "sil";
  private archiveAudio: HTMLAudioElement | null = null;
  private archiveAnimationFrame = 0;
  private archiveMotionIndex = -1;
  private archiveSession: AssistantSpeechSession | null = null;
  private readonly polling = new Map<string, AbortController>();
  private readonly sessionClientIds = new Map<string, string | number>();
  private readonly sessionAutoplay = new Map<string, boolean>();
  private diagnostic: SpeechPlaybackDiagnostic = {};
  private readonly handleVisibilityChange = () => {
    if (document.hidden) this.sendPlaybackProgress(true);
  };

  constructor(callbacks: SpeechControllerCallbacks) {
    this.callbacks = callbacks;
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  configure(capabilities?: AssistantSpeechCapabilities | null) {
    this.capabilities = capabilities || null;
    const realtime = this.capabilities?.realtime;
    this.updateDiagnostic({
      pipelineMode: realtime?.pipeline_mode,
      textTtsParallel: realtime?.text_tts_parallel,
      commandProtocol: realtime?.command_protocol,
      timelineClock: realtime?.timeline_clock,
      recoveryEnabled: realtime?.recovery_enabled,
      durableArchiveEnabled: realtime?.durable_archive_enabled
    });
    if (!this.capabilities?.enabled) {
      this.callbacks.onStatus?.("disabled", "语音能力未开放");
    }
  }

  private setStatus(state: SpeechPlaybackState, message?: string) {
    this.callbacks.onStatus?.(state, message);
  }

  private updateDiagnostic(patch: Partial<SpeechPlaybackDiagnostic>) {
    this.diagnostic = { ...this.diagnostic, ...patch };
    this.callbacks.onDiagnostic?.({ ...this.diagnostic });
  }

  private updateSessionDiagnostic(session: AssistantSpeechSession) {
    this.updateDiagnostic({
      streamId: session.stream_id || this.realtimeStreamId || undefined,
      sessionId: session.session_id || this.realtimeSessionId || undefined,
      sessionStatus: session.status,
      liveDeliveryStatus: session.live_delivery_status,
      archiveStatus: session.archive_status,
      terminalEvent: session.terminal_event,
      archiveDisposition: session.archive_disposition,
      lastAudioSequence: session.last_audio_seq,
      audioSampleCount: session.audio_sample_count,
      relayedSampleCount: session.relayed_sample_count,
      lastPlayedSample: session.last_played_sample,
      archiveResumeMs: session.archive_resume_ms,
      pollAfterMs: session.poll_after_ms,
      errorCode: session.error_code
    });
  }

  private chooseTimeline(): SpeechTimelineRequest {
    const kinds = this.capabilities?.timeline_kinds || [];
    if (kinds.includes("viseme")) return "viseme";
    if (kinds.includes("word")) return "word";
    return "none";
  }

  private supportsRealtime() {
    return Boolean(
      this.capabilities?.enabled &&
        this.capabilities.delivery_modes?.includes("realtime") &&
        this.capabilities.realtime?.enabled &&
        window.AudioContext &&
        "audioWorklet" in window.AudioContext.prototype &&
        window.WebSocket
    );
  }

  primeRealtimeAudio() {
    if (!this.supportsRealtime()) return;
    void this.ensureAudioContext().catch(() => {
      // prepareSpeech will switch to archive if the browser still rejects audio.
    });
  }

  async prepareSpeech(
    context: PrepareSpeechContext
  ): Promise<AssistantSpeechRequest | undefined> {
    const capabilities = this.capabilities;
    if (!capabilities?.enabled) return undefined;

    const timeline = this.chooseTimeline();
    const voiceAlias =
      context.voiceAlias || capabilities.default_voice_alias || undefined;
    const baseRequest: AssistantSpeechRequest = {
      enabled: true,
      voice_alias: voiceAlias,
      timeline,
      motion_cues: capabilities.motion_cues
    };

    await this.stopLive("next_answer", false);
    if (this.supportsRealtime()) {
      this.setStatus("preparing", "正在建立实时语音");
      const controller = new AbortController();
      try {
        await this.ensureAudioContext();
        const reservation = await createAssistantSpeechStreamReservation(
          {
            conversation_id: context.conversationId,
            course_id: context.courseId,
            target_student_id: context.targetStudentId,
            interaction_scope: context.interactionScope,
            voice_alias: voiceAlias,
            timeline,
            motion_cues: capabilities.motion_cues,
            client: {
              contract_version: "assistant_speech_stream.v1",
              audio_formats: ["pcm_s16le"],
              audio_worklet: true,
              renderer: "threejs"
            }
          },
          controller.signal,
          capabilities.realtime!.reservation_endpoint
        );
        await this.connectRealtime(reservation);
        return {
          ...baseRequest,
          delivery: "realtime",
          stream_id: reservation.stream.stream_id
        };
      } catch {
        await this.stopLive("realtime_prepare_failed", false);
        this.setStatus("finalizing", "实时语音不可用，已切换完整录音");
      }
    }

    // The deployed API exposes archive playback as its base speech contract.
    // Realtime fields are optional extensions, so their absence must not
    // disable an otherwise enabled speech session.
    if (capabilities.archive?.enabled !== false) {
      return { ...baseRequest, delivery: "archive" };
    }
    return undefined;
  }

  private async ensureAudioContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioContextCtor = window.AudioContext;
      this.audioContext = new AudioContextCtor({ latencyHint: "interactive" });
      this.audioContext.onstatechange = () => {
        this.updateDiagnostic({ audioContextState: this.audioContext?.state });
      };
      this.workletModuleLoaded = false;
      this.workletModulePromise = null;
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    this.updateDiagnostic({ audioContextState: this.audioContext.state });
    if (!this.workletModuleLoaded) {
      if (!this.workletModulePromise) {
        const workletUrl = new URL(
          "./assistant-speech-player.worklet.js",
          import.meta.url
        );
        this.workletModulePromise = this.audioContext.audioWorklet
          .addModule(workletUrl.href)
          .then(() => {
            this.workletModuleLoaded = true;
          })
          .finally(() => {
            this.workletModulePromise = null;
          });
      }
      await this.workletModulePromise;
    }
  }

  private async createWorklet(sampleRate: number, jitterBufferMs: number) {
    await this.ensureAudioContext();
    this.workletNode?.disconnect();
    this.workletNode = new AudioWorkletNode(
      this.audioContext!,
      "assistant-speech-player",
      {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          sourceSampleRate: sampleRate,
          jitterBufferMs
        }
      }
    );
    this.workletNode.port.onmessage = event =>
      this.handleWorkletMessage(event.data || {});
    this.workletNode.connect(this.audioContext!.destination);
    this.realtimeSampleRate = sampleRate;
  }

  async testAudioOutput() {
    try {
      await this.ensureAudioContext();
      const context = this.audioContext!;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
      gain.gain.setValueAtTime(0.05, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.42);
      oscillator.addEventListener(
        "ended",
        () => {
          oscillator.disconnect();
          gain.disconnect();
        },
        { once: true }
      );
      this.updateDiagnostic({
        clientEvent: "audio.output_test",
        audioContextState: context.state
      });
      return true;
    } catch {
      this.updateDiagnostic({ clientEvent: "audio.output_test_failed" });
      return false;
    }
  }

  private connectRealtime(
    reservation: AssistantSpeechStreamReservationResponse
  ) {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      let readyAccepted = false;
      let ticket = reservation.stream.ticket;
      const websocket = new WebSocket(reservation.stream.ws_url);
      websocket.binaryType = "arraybuffer";
      this.websocket = websocket;
      this.realtimeStreamId = reservation.stream.stream_id;
      this.realtimeSessionId = "";
      this.lastAudioSequence = 0;
      this.lastServerEventSequence = 0;
      this.playedSample = 0;
      this.bufferedMs = 0;
      this.peakRms = 0;
      this.liveStarted = false;
      this.liveFailed = false;
      this.liveTerminalReceived = false;
      this.liveArchiveStatus = "";
      this.timeline = null;
      this.currentViseme = "sil";
      this.updateDiagnostic({
        streamId: reservation.stream.stream_id,
        sessionId: undefined,
        phase: "reserved",
        serverEvent: undefined,
        clientEvent: "reservation.created",
        eventSequence: undefined,
        segmentSequence: undefined,
        audioSequence: undefined,
        playedSample: undefined,
        bufferedMs: undefined,
        peakRms: undefined,
        audioContextState: this.audioContext?.state,
        websocketCloseCode: undefined,
        websocketCloseReason: undefined,
        websocketWasClean: undefined,
        sessionStatus: "reserved",
        liveDeliveryStatus: undefined,
        archiveStatus: undefined,
        terminalEvent: undefined,
        archiveDisposition: undefined,
        lastAudioSequence: undefined,
        audioSampleCount: undefined,
        relayedSampleCount: undefined,
        lastPlayedSample: undefined,
        archiveResumeMs: undefined,
        pollAfterMs: undefined,
        errorCode: undefined
      });

      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("speech_stream_ready_timeout"));
        websocket.close(1000, "ready_timeout");
      }, 8000);

      websocket.addEventListener("open", () => {
        websocket.send(
          JSON.stringify({
            event: "client.hello",
            ticket,
            contract_version: "assistant_speech_stream.v1",
            last_audio_seq: 0
          })
        );
        ticket = "";
        this.setStatus("connecting", "实时语音已连接");
      });

      websocket.addEventListener("message", event => {
        if (typeof event.data === "string") {
          let control: AssistantSpeechServerControl;
          try {
            control = JSON.parse(event.data) as AssistantSpeechServerControl;
          } catch {
            return;
          }
          void this.handleServerControl(control)
            .then(() => {
              if (control.event === "stream.ready" && !settled) {
                settled = true;
                readyAccepted = true;
                window.clearTimeout(timeout);
                resolve();
              }
            })
            .catch(error => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              websocket.close(1000, "player_setup_failed");
              reject(error);
            });
          return;
        }
        if (event.data instanceof ArrayBuffer)
          this.handleRealtimeAudio(event.data);
      });

      websocket.addEventListener("error", () => {
        this.liveFailed = true;
        this.updateDiagnostic({ clientEvent: "websocket.error" });
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          reject(new Error("speech_websocket_failed"));
        }
      });

      websocket.addEventListener("close", event => {
        window.clearTimeout(timeout);
        if (!readyAccepted) {
          if (!settled) {
            settled = true;
            reject(new Error("speech_websocket_closed"));
          }
          return;
        }
        if (this.websocket !== websocket) return;
        this.websocket = null;
        this.updateDiagnostic({
          clientEvent: "websocket.closed",
          websocketCloseCode: event.code,
          websocketCloseReason: event.reason || undefined,
          websocketWasClean: event.wasClean
        });
        if (!settled) {
          settled = true;
          reject(new Error("speech_websocket_closed"));
          return;
        }
        if (!this.liveTerminalReceived) {
          this.liveFailed = true;
          this.setStatus(
            this.realtimeSessionId ? "finalizing" : "failed",
            this.realtimeSessionId
              ? "实时连接中断，正在等待完整录音"
              : "实时连接中断，文字回答不受影响"
          );
          void this.refreshSession(this.realtimeSessionId);
        }
        this.workletNode?.port.postMessage({ type: "end" });
      });
    });
  }

  private async handleServerControl(control: AssistantSpeechServerControl) {
    if (
      control.event_seq &&
      control.event_seq <= this.lastServerEventSequence
    ) {
      return;
    }
    if (control.event_seq) this.lastServerEventSequence = control.event_seq;
    this.updateDiagnostic({
      streamId: control.stream_id || this.realtimeStreamId || undefined,
      sessionId: control.session_id || this.realtimeSessionId || undefined,
      phase: control.phase || this.diagnostic.phase,
      serverEvent: control.event,
      eventSequence: control.event_seq || undefined,
      segmentSequence: control.segment_seq,
      archiveStatus: control.archive_status || this.diagnostic.archiveStatus,
      terminalEvent: control.terminal_event,
      archiveDisposition: control.archive_disposition,
      lastAudioSequence: control.last_audio_seq,
      audioSampleCount: control.audio_sample_count,
      relayedSampleCount: control.relayed_sample_count,
      lastPlayedSample: control.last_played_sample,
      archiveResumeMs: control.archive_resume_ms,
      errorCode: control.error_code
    });

    switch (control.event) {
      case "stream.ready": {
        const audio = control.audio;
        if (!audio || audio.codec !== "pcm_s16le" || audio.channels !== 1) {
          throw new Error("speech_stream_audio_unsupported");
        }
        await this.createWorklet(
          audio.sample_rate_hz,
          control.jitter_buffer_ms ||
            this.capabilities?.realtime.recommended_jitter_buffer_ms ||
            120
        );
        this.sendRealtimeControl({
          event: "client.ready",
          buffered_ms: 0,
          client_time_ms: Date.now()
        });
        break;
      }
      case "stream.bound":
        this.realtimeSessionId = control.session_id || "";
        this.setStatus("connecting", "语音流已绑定，等待首段内容");
        break;
      case "provider.connected":
        this.setStatus("connecting", "语音引擎已连接，等待首段音频");
        break;
      case "segment.committed":
        this.setStatus("connecting", "首段内容已提交");
        break;
      case "segment.dispatched":
        this.setStatus("connecting", "首段语音正在合成");
        break;
      case "audio.started":
        this.setStatus("connecting", "首段音频正在缓冲");
        break;
      case "timeline.delta":
        if (control.timeline) this.mergeTimeline(control.timeline);
        break;
      case "stream.completed":
        this.liveTerminalReceived = true;
        this.realtimeSessionId = control.session_id || this.realtimeSessionId;
        this.liveArchiveStatus = control.archive_status || "";
        this.workletNode?.port.postMessage({ type: "end" });
        this.setStatus(
          control.archive_status === "failed" ? "streaming" : "finalizing",
          control.archive_status === "failed"
            ? "实时音频已完成，完整录音归档失败"
            : "实时音频输入完成，等待播放结束"
        );
        void this.refreshSession(this.realtimeSessionId);
        break;
      case "stream.cancelled":
        this.liveTerminalReceived = true;
        this.workletNode?.port.postMessage({ type: "reset" });
        this.callbacks.renderer.reset();
        this.setStatus("cancelled", "语音已停止");
        void this.refreshSession(control.session_id || this.realtimeSessionId);
        break;
      case "stream.error":
        this.liveTerminalReceived = true;
        this.liveFailed = true;
        this.liveArchiveStatus = control.archive_status || "";
        this.workletNode?.port.postMessage({ type: "end" });
        this.callbacks.renderer.setState("error");
        this.setStatus(
          control.session_id ? "finalizing" : "failed",
          control.session_id
            ? "实时播报中断，正在恢复完整录音"
            : "实时语音中断，文字回答不受影响"
        );
        void this.refreshSession(control.session_id || this.realtimeSessionId);
        break;
      default:
        break;
    }
  }

  private mergeTimeline(delta: AssistantSpeechTimeline) {
    const dedupe = <T>(items: T[], keyOf: (item: T) => string) =>
      Array.from(new Map(items.map(item => [keyOf(item), item])).values());
    this.timeline = {
      ...(this.timeline || delta),
      ...delta,
      words: dedupe(
        [...(this.timeline?.words || []), ...(delta.words || [])],
        cue => `${cue.start_ms}:${cue.end_ms}:${cue.text}`
      ),
      visemes: dedupe(
        [...(this.timeline?.visemes || []), ...(delta.visemes || [])],
        cue => `${cue.start_ms}:${cue.end_ms}:${cue.id}`
      )
    };
  }

  private handleRealtimeAudio(buffer: ArrayBuffer) {
    if (this.liveTerminalReceived) return;
    try {
      const frame = parseA3AUFrame(buffer);
      const sequenceGap =
        this.lastAudioSequence > 0 &&
        frame.sequence !== this.lastAudioSequence + 1;
      if (frame.sequence <= this.lastAudioSequence) return;
      this.lastAudioSequence = frame.sequence;
      if (frame.sequence === 1 || sequenceGap || frame.discontinuity) {
        this.updateDiagnostic({
          clientEvent: sequenceGap ? "audio.sequence_gap" : "audio.frame",
          audioSequence: frame.sequence
        });
      }
      if (sequenceGap || frame.discontinuity) {
        this.currentViseme = "sil";
        this.callbacks.renderer.applyViseme("sil", 0);
      }
      const pcmBuffer = frame.pcm.buffer;
      this.workletNode?.port.postMessage(
        {
          type: "append",
          pcm: pcmBuffer,
          startSample: frame.startSample,
          discontinuity: sequenceGap || frame.discontinuity
        },
        [pcmBuffer]
      );
    } catch {
      this.liveFailed = true;
      this.workletNode?.port.postMessage({ type: "end" });
      this.setStatus("finalizing", "实时音频校验失败，正在等待完整录音");
    }
  }

  private handleWorkletMessage(data: Record<string, any>) {
    if (data.type === "started") {
      this.liveStarted = true;
      this.updateDiagnostic({ clientEvent: "playback.started" });
      this.callbacks.renderer.setState("speaking");
      this.setStatus("streaming", "正在实时播报");
      this.sendRealtimeControl({
        event: "playback.started",
        played_sample: Math.max(0, Number(data.playedSample) || 0),
        buffered_ms: 0,
        client_time_ms: Date.now()
      });
      this.sendPlaybackProgress(true);
      return;
    }
    if (data.type === "stats") {
      this.playedSample = Math.max(0, Number(data.playedSample) || 0);
      this.bufferedMs = clamp(Number(data.bufferedMs) || 0, 0, 60000);
      const rms = clamp(Number(data.rms) || 0, 0, 1);
      this.peakRms = Math.max(this.peakRms, rms);
      this.applyRealtimeRenderer(this.playedSample, rms);
      const now = Date.now();
      if (now - this.lastProgressSentAt >= 750) {
        this.lastProgressSentAt = now;
        this.updateDiagnostic({
          audioSequence: this.lastAudioSequence,
          playedSample: this.playedSample,
          bufferedMs: this.bufferedMs,
          peakRms: Number(this.peakRms.toFixed(6))
        });
        this.sendPlaybackProgress();
      }
      return;
    }
    if (data.type === "ended") {
      this.playedSample = Math.max(
        0,
        Number(data.playedSample) || this.playedSample
      );
      this.bufferedMs = 0;
      this.sendRealtimeControl({
        event: "playback.ended",
        last_audio_seq: this.lastAudioSequence,
        played_sample: this.playedSample,
        client_time_ms: Date.now()
      });
      this.callbacks.renderer.reset();
      this.updateDiagnostic({
        clientEvent:
          this.liveFailed && !this.liveTerminalReceived
            ? "playback.interrupted"
            : "playback.ended",
        audioSequence: this.lastAudioSequence,
        playedSample: this.playedSample,
        bufferedMs: 0,
        peakRms: Number(this.peakRms.toFixed(6))
      });
      this.setStatus(
        this.liveFailed && !this.liveTerminalReceived
          ? "finalizing"
          : this.liveArchiveStatus === "failed"
            ? "ready"
            : "finalizing",
        this.liveFailed && !this.liveTerminalReceived
          ? "实时播报中断，正在等待完整录音"
          : this.liveArchiveStatus === "failed"
            ? "实时播报完成，完整录音不可用"
            : "实时播报完成，正在生成完整录音"
      );
    }
  }

  private applyRealtimeRenderer(playedSample: number, rms: number) {
    const nowMs = (playedSample / this.realtimeSampleRate) * 1000;
    const viseme = this.findActiveViseme(this.timeline?.visemes || [], nowMs);
    if (viseme) {
      const id = VALID_VISEMES.has(viseme.id) ? viseme.id : "sil";
      if (id !== this.currentViseme || id === "sil") {
        this.currentViseme = id;
        this.callbacks.renderer.applyViseme(id, clamp(viseme.weight, 0, 1));
      }
      this.callbacks.renderer.setAmplitude(0);
    } else {
      this.currentViseme = "sil";
      this.callbacks.renderer.setAmplitude(clamp(rms * 4, 0, 1));
    }
  }

  private findActiveViseme(cues: AssistantSpeechVisemeCue[], nowMs: number) {
    let low = 0;
    let high = cues.length - 1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      const cue = cues[middle];
      if (nowMs < cue.start_ms) high = middle - 1;
      else if (nowMs >= cue.end_ms) low = middle + 1;
      else return cue;
    }
    return undefined;
  }

  private sendRealtimeControl(payload: Record<string, unknown>) {
    if (this.websocket?.readyState !== WebSocket.OPEN) return;
    this.websocket.send(JSON.stringify(payload));
  }

  private sendPlaybackProgress(force = false) {
    if (!force && this.websocket?.readyState !== WebSocket.OPEN) return;
    this.sendRealtimeControl({
      event: "playback.progress",
      last_audio_seq: this.lastAudioSequence,
      played_sample: this.playedSample,
      buffered_ms: this.bufferedMs,
      client_time_ms: Date.now()
    });
  }

  handleChatEvent(
    event: AssistantChatStreamEvent,
    clientMessageId: string | number
  ) {
    const session = event.speech;
    if (session?.session_id) {
      this.realtimeSessionId = session.session_id;
      this.updateSessionDiagnostic(session);
      this.sessionClientIds.set(session.session_id, clientMessageId);
      this.callbacks.onSession?.(
        clientMessageId,
        session,
        this.mapSessionState(session)
      );
    }
    if (event.event === "speech.stream.degraded") {
      this.liveFailed = true;
      this.setStatus("finalizing", "实时语音已降级，等待完整录音");
    }
  }

  trackSession(
    session: AssistantSpeechSession,
    clientMessageId: string | number,
    autoplay = true
  ) {
    if (!session.session_id || session.status === "unavailable") {
      this.callbacks.onSession?.(
        clientMessageId,
        session,
        session.status === "unavailable" ? "unavailable" : "failed"
      );
      return;
    }
    this.sessionClientIds.set(session.session_id, clientMessageId);
    this.sessionAutoplay.set(session.session_id, autoplay);
    this.updateSessionDiagnostic(session);
    this.callbacks.onSession?.(
      clientMessageId,
      session,
      this.mapSessionState(session)
    );
    if (session.archive_status === "failed") {
      this.setStatus(
        this.liveStarted ? "ready" : "failed",
        this.liveStarted
          ? "实时播报可用，完整录音归档失败"
          : "语音生成失败，文字回答不受影响"
      );
      return;
    }
    if (READY_STATUSES.has(session.status)) {
      void this.resolveReadySession(session);
      return;
    }
    if (!RUNNING_STATUSES.has(session.status)) return;
    if (this.polling.has(session.session_id)) return;
    const controller = new AbortController();
    this.polling.set(session.session_id, controller);
    void this.pollUntilReady(session, controller);
  }

  private async refreshSession(sessionId?: string) {
    if (!sessionId) return;
    try {
      const session = (await getAssistantSpeechSession(sessionId, false))
        .speech;
      this.updateSessionDiagnostic(session);
      const clientMessageId = this.sessionClientIds.get(sessionId);
      if (clientMessageId !== undefined) {
        this.trackSession(session, clientMessageId, true);
      }
    } catch {
      // The stream terminal event is authoritative for live playback. Session
      // polling can resume when its SSE projection arrives.
    }
  }

  private async pollUntilReady(
    initial: AssistantSpeechSession,
    controller: AbortController
  ) {
    let current = initial;
    const sessionId = initial.session_id!;
    try {
      while (RUNNING_STATUSES.has(current.status)) {
        await delay(
          clamp(
            current.poll_after_ms || 1000,
            250,
            document.hidden ? 10000 : 5000
          ),
          controller.signal
        );
        const response = await getAssistantSpeechSession(
          sessionId,
          false,
          controller.signal
        );
        current = response.speech;
        this.updateSessionDiagnostic(current);
        const clientMessageId = this.sessionClientIds.get(sessionId);
        if (clientMessageId !== undefined) {
          this.callbacks.onSession?.(
            clientMessageId,
            current,
            this.mapSessionState(current)
          );
        }
      }
      if (READY_STATUSES.has(current.status)) {
        await this.resolveReadySession(current);
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        this.setStatus("failed", "语音归档状态获取失败");
      }
    } finally {
      this.polling.delete(sessionId);
    }
  }

  private async resolveReadySession(session: AssistantSpeechSession) {
    if (!session.session_id) return;
    let ready = session;
    if (!ready.timeline || !ready.audio?.url) {
      try {
        ready = (await getAssistantSpeechSession(session.session_id, true))
          .speech;
      } catch {
        this.setStatus("ready", "完整录音已就绪");
        return;
      }
    }
    const clientMessageId = this.sessionClientIds.get(session.session_id);
    if (clientMessageId !== undefined) {
      this.callbacks.onSession?.(clientMessageId, ready, "ready");
    }
    this.setStatus("ready", "完整录音已就绪");
    const shouldAutoplay =
      this.sessionAutoplay.get(session.session_id) &&
      (ready.delivery !== "realtime" || this.liveFailed || !this.liveStarted);
    if (shouldAutoplay && ready.audio?.url) {
      await this.playArchive(
        ready,
        clientMessageId,
        this.shouldResumeArchive(ready)
      );
    }
  }

  async playSession(
    session: AssistantSpeechSession | { session_id: string },
    clientMessageId: string | number
  ) {
    const sessionId = session.session_id;
    if (!sessionId) return;
    this.sessionClientIds.set(sessionId, clientMessageId);
    try {
      const ready = (await getAssistantSpeechSession(sessionId, true)).speech;
      if (READY_STATUSES.has(ready.status) && ready.audio?.url) {
        await this.playArchive(ready, clientMessageId);
      } else if (RUNNING_STATUSES.has(ready.status)) {
        this.trackSession(ready, clientMessageId, true);
      } else {
        this.callbacks.onSession?.(
          clientMessageId,
          ready,
          this.mapSessionState(ready)
        );
      }
    } catch {
      this.setStatus("failed", "语音不可用或已失效");
    }
  }

  private async playArchive(
    session: AssistantSpeechSession,
    clientMessageId?: string | number,
    resumeFromLive = false
  ) {
    const urlExpiresAt = session.audio?.url_expires_at
      ? Date.parse(session.audio.url_expires_at)
      : 0;
    if (
      session.session_id &&
      urlExpiresAt > 0 &&
      urlExpiresAt <= Date.now() + 20000
    ) {
      try {
        session = (await getAssistantSpeechSession(session.session_id, true))
          .speech;
      } catch {
        this.setStatus("failed", "语音播放地址刷新失败");
        return;
      }
    }
    if (!session.audio?.url) return;
    await this.stopLive("archive_playback", false);
    this.stopArchiveAudio();
    this.archiveSession = session;
    this.archiveMotionIndex = -1;
    const audio = new Audio(session.audio.url);
    audio.preload = "auto";
    if (resumeFromLive && this.shouldResumeArchive(session)) {
      audio.currentTime = session.archive_resume_ms! / 1000;
    }
    this.archiveAudio = audio;

    const notify = (state: SpeechPlaybackState) => {
      if (clientMessageId !== undefined) {
        this.callbacks.onSession?.(clientMessageId, session, state);
      }
    };
    audio.addEventListener("playing", () => {
      this.callbacks.renderer.setState("speaking");
      this.setStatus("playing", "正在播放完整录音");
      notify("playing");
      this.tickArchiveRenderer();
    });
    audio.addEventListener("pause", () => {
      if (!audio.ended) notify("paused");
    });
    audio.addEventListener("ended", () => {
      this.stopArchiveAnimation();
      this.callbacks.renderer.reset();
      this.setStatus("ready", "完整录音播放完成");
      notify("ready");
    });
    audio.addEventListener("waiting", () => {
      this.callbacks.renderer.setState("listening");
    });
    audio.addEventListener("error", () => {
      this.stopArchiveAnimation();
      this.callbacks.renderer.reset();
      this.setStatus("failed", "完整录音播放失败");
      notify("failed");
    });

    try {
      await audio.play();
    } catch {
      this.setStatus("ready", "点击消息中的播放按钮收听完整录音");
      notify("ready");
    }
  }

  private shouldResumeArchive(session: AssistantSpeechSession) {
    return Boolean(
      session.delivery === "realtime" &&
        session.archive_disposition !== "discard" &&
        session.archive_resume_ms &&
        session.archive_resume_ms > 0 &&
        (this.liveFailed || !this.liveStarted)
    );
  }

  private tickArchiveRenderer = () => {
    const audio = this.archiveAudio;
    const session = this.archiveSession;
    if (!audio || !session || audio.paused || audio.ended) return;
    const nowMs = audio.currentTime * 1000;
    const viseme = this.findActiveViseme(
      session.timeline?.visemes || [],
      nowMs
    );
    if (viseme) {
      const id = VALID_VISEMES.has(viseme.id) ? viseme.id : "sil";
      this.callbacks.renderer.applyViseme(id, clamp(viseme.weight, 0, 1));
    } else {
      this.callbacks.renderer.setAmplitude(0.35);
    }
    this.applyArchiveMotion(session.motion_cues || [], nowMs);
    this.archiveAnimationFrame = requestAnimationFrame(
      this.tickArchiveRenderer
    );
  };

  private applyArchiveMotion(cues: AssistantSpeechMotionCue[], nowMs: number) {
    const index = cues.findIndex(
      cue => nowMs >= cue.start_ms && nowMs < cue.start_ms + cue.duration_ms
    );
    if (index < 0 || index === this.archiveMotionIndex) return;
    this.archiveMotionIndex = index;
    const cue = cues[index];
    this.callbacks.renderer.triggerMotion(
      cue.key,
      cue.duration_ms,
      cue.target_ref
    );
  }

  private stopArchiveAnimation() {
    if (this.archiveAnimationFrame)
      cancelAnimationFrame(this.archiveAnimationFrame);
    this.archiveAnimationFrame = 0;
  }

  private stopArchiveAudio() {
    this.stopArchiveAnimation();
    if (this.archiveAudio) {
      this.archiveAudio.pause();
      this.archiveAudio.removeAttribute("src");
      this.archiveAudio.load();
    }
    this.archiveAudio = null;
    this.archiveSession = null;
  }

  async stopPlayback(cancelServer = false) {
    const sessionId = this.realtimeSessionId || this.archiveSession?.session_id;
    this.stopArchiveAudio();
    await this.stopLive(
      cancelServer ? "user_cancelled" : "user_stopped",
      cancelServer
    );
    this.callbacks.renderer.reset();
    this.setStatus(cancelServer ? "cancelled" : "paused", "语音已停止");
    if (cancelServer && sessionId) {
      try {
        const response = await cancelAssistantSpeechSession(sessionId);
        const clientMessageId = this.sessionClientIds.get(sessionId);
        if (clientMessageId !== undefined) {
          this.trackSession(response.speech, clientMessageId, false);
        }
      } catch {
        this.setStatus("failed", "停止语音请求失败");
      }
    }
  }

  reset() {
    this.polling.forEach(controller => controller.abort());
    this.polling.clear();
    this.sessionClientIds.clear();
    this.sessionAutoplay.clear();
    this.stopArchiveAudio();
    void this.stopLive("context_changed", false);
    this.liveStarted = false;
    this.liveFailed = false;
    this.liveTerminalReceived = false;
    this.liveArchiveStatus = "";
    this.callbacks.renderer.reset();
  }

  private async stopLive(reason: string, cancelServer: boolean) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.sendRealtimeControl(
        cancelServer
          ? { event: "stream.cancel", reason }
          : { event: "client.goodbye", reason }
      );
      this.websocket.close(1000, reason.slice(0, 120));
    }
    this.websocket = null;
    this.workletNode?.port.postMessage({ type: "reset" });
    this.workletNode?.disconnect();
    this.workletNode = null;
    this.realtimeStreamId = "";
    this.realtimeSessionId = "";
    this.lastAudioSequence = 0;
    this.lastServerEventSequence = 0;
    this.peakRms = 0;
    this.bufferedMs = 0;
    this.liveTerminalReceived = false;
    this.timeline = null;
    this.currentViseme = "sil";
    this.updateDiagnostic({
      streamId: undefined,
      sessionId: undefined,
      phase: undefined,
      serverEvent: undefined,
      clientEvent: "stream.closed",
      eventSequence: undefined,
      segmentSequence: undefined,
      audioSequence: undefined,
      playedSample: undefined,
      bufferedMs: undefined,
      peakRms: undefined,
      audioContextState: this.audioContext?.state,
      websocketCloseCode: undefined,
      websocketCloseReason: undefined,
      websocketWasClean: undefined,
      sessionStatus: undefined,
      liveDeliveryStatus: undefined,
      archiveStatus: undefined,
      terminalEvent: undefined,
      archiveDisposition: undefined,
      lastAudioSequence: undefined,
      audioSampleCount: undefined,
      relayedSampleCount: undefined,
      lastPlayedSample: undefined,
      archiveResumeMs: undefined,
      pollAfterMs: undefined,
      errorCode: undefined
    });
  }

  private mapSessionState(
    session: AssistantSpeechSession
  ): SpeechPlaybackState {
    if (session.status === "unavailable") return "unavailable";
    if (READY_STATUSES.has(session.status)) return "ready";
    if (session.status === "cancelled") return "cancelled";
    if (
      ["failed", "partial", "unknown_outcome", "expired"].includes(
        session.status
      )
    ) {
      return "failed";
    }
    if (
      ["reserved", "connecting", "queued", "synthesizing", "retrying"].includes(
        session.status
      )
    ) {
      return "connecting";
    }
    if (session.status === "streaming") return "streaming";
    return "finalizing";
  }

  dispose() {
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
    this.polling.forEach(controller => controller.abort());
    this.polling.clear();
    this.stopArchiveAudio();
    void this.stopLive("page_unloaded", false);
    this.callbacks.renderer.reset();
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
    }
    this.audioContext = null;
    this.workletModulePromise = null;
  }
}
