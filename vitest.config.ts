import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure-core tests need no DOM. storage.test.ts injects its own localStorage stub.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
