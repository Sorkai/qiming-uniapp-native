import createModule from "./sherpa-onnx-wasm-main-tts.js";
import {
  createOfflineTts,
  getDefaultOfflineTtsModelType
} from "./sherpa-onnx-tts.js";

const LOCAL_TTS_SOURCE = "qiming-local-tts";

let tts = null;

function post(payload, transfer) {
  self.postMessage({ source: LOCAL_TTS_SOURCE, ...payload }, transfer || []);
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  return String(error);
}

const Module = await createModule({
  locateFile: (path, scriptDirectory = "") => scriptDirectory + path,
  setStatus: status => {
    post({ type: "status", status: String(status || "") });
  },
  print: message => {
    post({ type: "log", message: String(message || "") });
  },
  printErr: message => {
    post({ type: "log", level: "warn", message: String(message || "") });
  }
});

try {
  tts = createOfflineTts(Module);
  post({
    type: "ready",
    modelType: getDefaultOfflineTtsModelType(),
    numSpeakers: tts.numSpeakers,
    sampleRate: tts.sampleRate
  });
} catch (error) {
  post({
    type: "error",
    message: `本地女声初始化失败：${getErrorMessage(error)}`
  });
}

self.onmessage = event => {
  const { type, requestId, text, sid, speed } = event.data || {};
  if (type !== "generate" || !tts) return;

  try {
    const audio = tts.generate({
      text: String(text || ""),
      sid: Number(sid || 0),
      speed: Number(speed || 1)
    });
    const samples = audio.samples;
    post(
      {
        type: "result",
        requestId,
        samples,
        sampleRate: audio.sampleRate || tts.sampleRate
      },
      [samples.buffer]
    );
  } catch (error) {
    post({
      type: "error",
      requestId,
      message: `本地女声生成失败：${getErrorMessage(error)}`
    });
  }
};
