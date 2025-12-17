import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path to support deployment to any subdirectory (e.g. GitHub Pages)
  base: './', 
})