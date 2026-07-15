class AssistantSpeechPlayerProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const config = options.processorOptions || {};
    this.sourceSampleRate = Number(config.sourceSampleRate) || 24000;
    this.jitterBufferMs = Number(config.jitterBufferMs) || 120;
    this.capacity = Math.max(this.sourceSampleRate * 120, 48000);
    this.buffer = new Float32Array(this.capacity);
    this.readIndex = 0;
    this.writeIndex = 0;
    this.available = 0;
    this.readPhase = 0;
    this.playedSample = 0;
    this.started = false;
    this.endedInput = false;
    this.endedReported = false;
    this.reportFrames = 0;
    this.rmsSum = 0;
    this.rmsCount = 0;
    this.port.onmessage = event => this.handleMessage(event.data || {});
  }

  reset(startSample = 0) {
    this.readIndex = 0;
    this.writeIndex = 0;
    this.available = 0;
    this.readPhase = 0;
    this.playedSample = Number(startSample) || 0;
    this.started = false;
    this.endedInput = false;
    this.endedReported = false;
    this.reportFrames = 0;
    this.rmsSum = 0;
    this.rmsCount = 0;
  }

  handleMessage(data) {
    if (data.type === "reset") {
      this.reset(data.startSample);
      return;
    }
    if (data.type === "end") {
      this.endedInput = true;
      return;
    }
    if (data.type !== "append" || !(data.pcm instanceof ArrayBuffer)) return;

    const pcm = new Int16Array(data.pcm);
    if (data.discontinuity) this.reset(data.startSample);
    if (!this.available && !this.started && Number.isFinite(data.startSample)) {
      this.playedSample = Number(data.startSample);
    }
    for (let index = 0; index < pcm.length; index += 1) {
      if (this.available >= this.capacity - 1) {
        this.readIndex = (this.readIndex + 1) % this.capacity;
        this.available -= 1;
        this.playedSample += 1;
      }
      this.buffer[this.writeIndex] = pcm[index] / 32768;
      this.writeIndex = (this.writeIndex + 1) % this.capacity;
      this.available += 1;
    }
  }

  sampleAt(offset) {
    if (offset >= this.available) return 0;
    return this.buffer[(this.readIndex + offset) % this.capacity];
  }

  report(force = false) {
    if (!force && this.reportFrames < Math.max(128, sampleRate * 0.06)) return;
    const rms = this.rmsCount ? Math.sqrt(this.rmsSum / this.rmsCount) : 0;
    this.port.postMessage({
      type: "stats",
      playedSample: Math.floor(this.playedSample),
      bufferedMs: Math.round((this.available / this.sourceSampleRate) * 1000),
      rms
    });
    this.reportFrames = 0;
    this.rmsSum = 0;
    this.rmsCount = 0;
  }

  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (!output) return true;

    const startThreshold = Math.max(
      2,
      Math.round((this.sourceSampleRate * this.jitterBufferMs) / 1000)
    );
    if (
      !this.started &&
      (this.available >= startThreshold ||
        (this.endedInput && this.available > 1))
    ) {
      this.started = true;
      this.endedReported = false;
      this.port.postMessage({
        type: "started",
        playedSample: Math.floor(this.playedSample)
      });
    }

    const sourceStep = this.sourceSampleRate / sampleRate;
    for (let index = 0; index < output.length; index += 1) {
      let value = 0;
      if (this.started && this.available > 1) {
        const current = this.sampleAt(0);
        const next = this.sampleAt(1);
        value = current + (next - current) * this.readPhase;
        this.readPhase += sourceStep;
        while (this.readPhase >= 1 && this.available > 1) {
          this.readPhase -= 1;
          this.readIndex = (this.readIndex + 1) % this.capacity;
          this.available -= 1;
          this.playedSample += 1;
        }
      }
      output[index] = value;
      this.rmsSum += value * value;
      this.rmsCount += 1;
      this.reportFrames += 1;
    }

    this.report();
    if (
      this.started &&
      this.endedInput &&
      this.available <= 1 &&
      !this.endedReported
    ) {
      this.endedReported = true;
      this.started = false;
      this.report(true);
      this.port.postMessage({
        type: "ended",
        playedSample: Math.floor(this.playedSample)
      });
    }
    return true;
  }
}

registerProcessor("assistant-speech-player", AssistantSpeechPlayerProcessor);
