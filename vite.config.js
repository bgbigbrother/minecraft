import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
* @type {import('vite').UserConfig}
*/
export default {
  // base: '/minecraft-threejs-clone/',
  plugins: [
    react({
      // Enable Fast Refresh for React components
      fastRefresh: true,
      // JSX runtime configuration
      jsxRuntime: 'automatic',
      // Babel configuration for JSX transformation
      babel: {
        plugins: [],
        babelrc: false,
        configFile: false,
      }
    })
  ],
  build: {
    sourcemap: true,
    // Configure multiple entry points for optimized builds
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Separate chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'three-vendor': ['three']
        }
      }
    },
    // Increase chunk size warning limit for Three.js
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Hot Module Replacement configuration
    hmr: {
      overlay: true
    },
    // Port configuration
    port: 5173,
    // Open browser on server start
    open: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'three'
    ]
  },
  // Resolve configuration
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
}