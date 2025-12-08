import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    // 修复中文路径问题
    fs: {
      strict: false
    }
  },
  build: {
    // 构建时也处理中文路径
    rollupOptions: {
      output: {
        // 确保文件名正确处理中文字符
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'js/[name].js',
        entryFileNames: 'js/[name].js'
      }
    }
  },
  // 处理静态资源路径
  publicDir: 'public',
  // 确保路径解析正确
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})