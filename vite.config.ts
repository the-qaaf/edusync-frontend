import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext", // Browsers supporting WebGPU also support esnext
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@mlc-ai")) {
                return "ai"; // Separate chunk for AI to be potentially reused or cached
              }
              if (id.includes("firebase")) {
                return "firebase";
              }
              if (
                id.includes("react-quill") ||
                id.includes("katex") ||
                id.includes("markdown")
              ) {
                return "editor";
              }
              if (
                id.includes("lucide") ||
                id.includes("clsx") ||
                id.includes("tailwind")
              ) {
                return "ui";
              }
            }
          },
        },
      },
    },
    worker: {
      format: "es",
    },
  };
});
