// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./", // Quan trọng: đường dẫn tương đối để Electron đọc được file sau khi build
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
