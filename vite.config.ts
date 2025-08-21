import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.lib.json',
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.ts',
    dir: 'src/',
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'mui-extensions',
      formats: ['es', 'umd'],
      fileName: (format: string) => `mui-extensions.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  // exclude the public folder contents from dist but allow them to be shown when running the dev script
  publicDir: command === 'serve' ? 'public' : false,
}));
