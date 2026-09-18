import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  assetsInclude: [
    /\.dat$/,
    /\.wasm$/,
    /\.so$/,
    /\.la$/,
  ],

  optimizeDeps: {
    exclude: [
      "@php-wasm/web",
      "@php-wasm/web-8-3",
      "@php-wasm/web-8-4",
      "@php-wasm/web-8-5",
    ],
  },
});