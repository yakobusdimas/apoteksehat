import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function safeUriMiddleware() {
  return {
    name: 'safe-uri-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        if (req.url) {
          try {
            decodeURI(req.url);
          } catch {
            // Fix unescaped % signs to prevent URI malformed error in Vite static middleware
            req.url = req.url.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    safeUriMiddleware(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Proxy API requests to Flask backend during development
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    proxy: {
      '/api/payment': {
        target: process.env.PAYMENT_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: process.env.BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/payment': {
        target: process.env.PAYMENT_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
