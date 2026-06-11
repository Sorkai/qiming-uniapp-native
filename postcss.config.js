// @ts-check

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "postcss-preset-env": {
      browsers: ["Chrome 83"],
      stage: false,
      features: {
        "cascade-layers": true,
        "media-query-ranges": true,
        "oklab-function": true,
        "lab-function": true,
        "color-mix": true
      }
    },
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {})
  }
};
