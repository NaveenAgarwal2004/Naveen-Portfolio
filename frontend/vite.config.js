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
    // Add proper MIME type handling
    fs: {
      strict: false,
    },
  },

  // Enhanced build configuration with optimization
  build: {
    outDir: 'dist', // Keep same output directory as CRA
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
          // CRITICAL FIX: Keep React in main bundle to prevent createContext errors
          // The issue was React being split into separate chunk causing module resolution failures
          if (id.includes('node_modules')) {
            // Keep React, ReactDOM in main bundle - DO NOT split
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'; // Put in main vendor chunk
            }
            if (id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            // Remove Three.js/Vanta reference - no longer used
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
        // Optimize chunk names and ensure proper file extensions
        chunkFileNames: 'assets/[name]-[hash].js',
        // Ensure entry files have proper extensions
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
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
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom',
      'axios',
      'lucide-react',
      'framer-motion'
    ],
    exclude: ['@vite/client', '@vite/env'],
    // Force React to be bundled properly
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
    }
  },

  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
})