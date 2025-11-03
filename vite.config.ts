import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  // 统一的基础路径配置
  const basePath = isProduction ? '/echonote-introduction/' : '/'

  return {
    // GitHub Pages deployment base path
    base: basePath,

    plugins: [
      vue({
        template: {
          compilerOptions: {
            // Remove comments in production
            comments: !isProduction,
          },
        },
      }),
      // Only use devtools in development
      ...(isProduction ? [] : [vueDevTools()]),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: id => {
            // Vendor chunk for large dependencies
            if (id.includes('node_modules')) {
              if (id.includes('vue')) {
                return 'vue-vendor'
              }
              if (id.includes('prismjs')) {
                return 'prism-vendor'
              }
              return 'vendor'
            }
            // UI components chunk
            if (id.includes('/components/ui/') || id.includes('/components/common/')) {
              return 'ui'
            }
            // Sections chunk
            if (id.includes('/components/sections/')) {
              return 'sections'
            }
            // Composables chunk
            if (id.includes('/composables/')) {
              return 'composables'
            }
          },
          // Optimize chunk file names
          chunkFileNames: chunkInfo => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const name = facadeModuleId.split('/').pop()?.replace('.vue', '') || 'chunk'
              return `js/${name}-[hash].js`
            }
            return 'js/[name]-[hash].js'
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: assetInfo => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
        },
      },
      // Optimize build size
      minify: 'terser',
      // Enable source maps for debugging in production (optional)
      sourcemap: false,
      // Set chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize assets
      assetsInlineLimit: 4096, // 4kb
      // Enable asset optimization
      target: 'esnext',
      // Reduce bundle size
      reportCompressedSize: false,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router', 'vue-i18n'],
      exclude: ['vite-plugin-vue-devtools'],
    },
    // Performance optimizations
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
        strict: true,
      },
      headers: {
        // Security headers for development
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    },
    // CSS optimizations
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        // Add any CSS preprocessor options here
      },
    },

    // Environment variables
    define: {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },

    // Esbuild optimizations for production
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },

    // Test configuration
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      exclude: ['**/tests/e2e/**', '**/node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          'dist/',
          '**/*.d.ts',
          'vite.config.ts',
          'tailwind.config.js',
          'postcss.config.js',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },
    },
  }
})
