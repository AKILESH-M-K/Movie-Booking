import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Movie-Booking/",
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ["**/db.json", "**/db.json.tmp", "**/server/**"],
    },
  },
});