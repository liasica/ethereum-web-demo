import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createStyleImportPlugin } from 'vite-plugin-style-import'

const pathSrc = resolve(__dirname, './src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: '@arco-design/web-vue',
          esModule: true,
          resolveStyle: (name: string) => {
            let target = name
            if (target === 'input-search') {
              target = 'input'
            }
            return `@arco-design/web-vue/es/${target}/style/css.js`
          },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': pathSrc,
      '~': pathSrc,
      '~@': pathSrc,
    },
  },
})
