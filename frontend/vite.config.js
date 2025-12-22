import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import daisyui from 'daisyui' // <-- 1. Đảm bảo đã import daisyui

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind({
      // 2. Thêm "content" để quét file
      // Mặc dù v4 tự động, việc này đảm bảo các plugin cũng quét đúng chỗ
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      
      // 3. Đặt daisyui VÀO BÊN TRONG mảng 'plugins' của tailwind
      plugins: [daisyui],
    }),
  ],
  server: {
    https: {
      key: '../.backend/backend/cert.key',
      cert: '../.backend/backend/cert.crt',
    },
  },
})
