import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This makes the environment variable available to the client-side code
  // during the build process, allowing Firebase to initialize correctly.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
