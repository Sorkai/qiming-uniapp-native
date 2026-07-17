# Qiming Local TTS

This folder vendors the sherpa-onnx WebAssembly TTS runtime and the
`matcha-icefall-zh-baker` Mandarin female voice package for offline demo use.

Source package:
https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.13.2/sherpa-onnx-wasm-simd-1.13.2-matcha-icefall-zh-baker.tar.bz2

The handwritten bridge is `local-tts-worker.js`; the other runtime/model files
come from the upstream package.
