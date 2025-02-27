import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',  // Đảm bảo đường dẫn tương đối, cần thiết cho Electron
  build: {
    outDir: 'build',  // Tạo thư mục "build" giống CRA
    assetsDir: 'assets',  // Chứa các file JS & CSS trong "assets/"
  },
  optimizeDeps: {
    include: ["@material-ui/core", "@material-ui/icons"],
    exclude: ["@mui/material/CircularProgress"],
  },
});
