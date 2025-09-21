import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Define global variables for compatibility
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Path aliases (equivalent to CRACO webpack alias)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external connections
    hmr: {
      port: 3001, // Use different port for HMR to avoid conflicts
    },
  },
  
  // Build configuration
  build: {
    outDir: 'build', // Keep same output directory as CRA
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
      },
    },
  },
  
  // Environment variables (Vite automatically loads .env files)
  envPrefix: 'VITE_', // Change from REACT_APP_ to VITE_
  
  // Static assets configuration - keep public directory structure
  publicDir: 'public', // Same as CRA
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js', // Use existing PostCSS config
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios',
      'lucide-react',
      'react-router-dom',
    ],
  },
})