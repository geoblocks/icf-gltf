import type { UserConfig } from 'vite'

export default {
  // ...
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      formats: ['es'],
      entry: './src/index.ts',
      fileName: 'ifc-gltf',
    }
  }
} satisfies UserConfig
