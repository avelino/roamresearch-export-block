import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-export-block',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RoamExportBlock',
      formats: ['es'],
      fileName: () => 'extension.js'
    },
    sourcemap: true,
    emptyOutDir: true
  }
});