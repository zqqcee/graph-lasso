import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  html: {
    template: "./index.html",
  },
  dev: {
    writeToDisk: true,
  },
  plugins: [pluginReact()],
  output: {
    externals: {
      d3: "window.d3",
    },
  },
});
