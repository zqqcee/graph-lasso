import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'


export default defineConfig({
  html: {
    template: "./index.html",
  },
  dev: {
    writeToDisk: true,
  },
  plugins: [pluginReact(), pluginNodePolyfill()],
  output: {
    externals: {
      d3: "window.d3",
    },
  },
});
