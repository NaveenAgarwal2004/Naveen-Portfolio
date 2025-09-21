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
  
  // Enhanced build configuration with optimization
  build: {
    outDir: 'build', // Keep same output directory as CRA
    sourcemap: process.env.NODE_ENV === 'development',
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            return 'vendor';
          }
          
          // Admin chunks (lazy loaded)
          if (id.includes('src/components/admin/')) {
            return 'admin';
          }
          
          // UI components chunk
          if (id.includes('src/components/ui/')) {
            return 'ui-components';
          }
          
          // Services chunk
          if (id.includes('src/services/')) {
            return 'services';
          }
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
    },
  },
  
  // Environment variables (Vite automatically loads .env files)
  envPrefix: 'VITE_', // Change from REACT_APP_ to VITE_
  
  // Static assets configuration - keep public directory structure
  publicDir: 'public', // Same as CRA
  
  // CSS configuration with optimization
  css: {
    postcss: './postcss.config.js', // Use existing PostCSS config
    devSourcemap: false,
  },
  
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
})