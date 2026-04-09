import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/study-tracker/', // your repo name
  plugins: [react()],
})