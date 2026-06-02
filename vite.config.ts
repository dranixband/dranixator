import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function locatorJsPlugin(): Plugin {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const babel = require("@babel/core");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const locatorPlugin = require("@locator/babel-jsx/dist/index.js");
  const plugin = locatorPlugin.default ?? locatorPlugin;

  return {
    name: "locator-jsx",
    enforce: "pre",
    async transform(code, id) {
      if (!/\.[jt]sx$/.test(id) || id.includes("node_modules")) return null;
      const result = await babel.transformAsync(code, {
        filename: id,
        ast: false,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["jsx", "typescript"] },
        plugins: [plugin],
        sourceMaps: true,
      });
      if (!result?.code) return null;
      return { code: result.code, map: result.map };
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/dranixator/",
  plugins: [
    ...(mode === "development" ? [locatorJsPlugin()] : []),
    react(),
    tailwindcss(),
  ],
}));
