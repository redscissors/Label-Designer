import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Honor an externally assigned port (e.g. the preview harness sets PORT when
  // the default 5173 is taken); fall back to Vite's default otherwise.
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {},
});
