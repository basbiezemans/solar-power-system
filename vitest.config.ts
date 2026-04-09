import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    typecheck: {
      enabled: false
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './lib')
    }
  }
});

