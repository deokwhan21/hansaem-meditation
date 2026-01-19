import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel에서 빌드 시점에 환경변수를 주입합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});