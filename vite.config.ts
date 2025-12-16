import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REPLACE '/edumanager/' WITH YOUR EXACT GITHUB REPOSITORY NAME SURROUNDED BY SLASHES
  // Example: if your repo is 'school-app', this should be '/school-app/'
  base: '/edumanager/', 
})