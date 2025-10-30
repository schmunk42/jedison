import { defineConfig } from 'vite'
import { resolve } from 'path'
import { generateBuildIdPlugin } from './scripts/generate-build-id.js'

export default defineConfig({
  plugins: [generateBuildIdPlugin()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, './src/index.js'),
      name: 'Jedison'
    },
    sourcemap: true,
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: 'jedison.js',
          dir: resolve(__dirname, './dist/esm'),
          sourcemap: true
        },
        {
          format: 'cjs',
          entryFileNames: 'jedison.cjs',
          dir: resolve(__dirname, './dist/cjs'),
          sourcemap: true,
          exports: 'auto'
        },
        {
          format: 'umd',
          name: 'Jedison',
          entryFileNames: 'jedison.umd.js',
          dir: resolve(__dirname, './dist/umd'),
          sourcemap: true,
          exports: 'default'
        }
      ]
    },
    minify: 'terser',
    emptyOutDir: true
  }
})
