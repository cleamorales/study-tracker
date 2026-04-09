import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/study-behavior-tracker/', // your repo name
  plugins: [react()],
})