import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true, 
    assetsInlineLimit:4096, 
    rollupOptions:{
      output:{
        manualChunks:{
          vendor:['react', 'react-dom']
        }, 
        assetFileNames:(accessInfo)=>{
          if (/png|jpe?g|svg|gif|webp/i.test(accessInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
   preview: {
    port: 4173,
    // host: true
  }
})
