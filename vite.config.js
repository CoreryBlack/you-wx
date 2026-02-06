import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

const _uni = uni && uni.default ? uni.default : uni

export default defineConfig({
  plugins: [_uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@root': path.resolve(__dirname, './')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@root/uni_modules/uview-next/theme.scss"; @import "@/styles/variables.scss";`
      }
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
    ,
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'static/assets/[hash][extname]'
          const ext = name.split('.').pop()
          return `static/${ext}/[name]-[hash][extname]`
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
