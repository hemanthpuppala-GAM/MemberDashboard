import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// PREVIEW build — served from /staging/preview/. Team staging uses '/staging/goldenage/', production '/'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/staging/preview/',
})
