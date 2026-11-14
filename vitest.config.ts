import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    fileParallelism: false, // un fichier de test à la fois : évite les téléchargements de MongoDB simultanés
    // Variables lues par src/config/env.ts au moment de l'import de l'app
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/kanban_test', // non utilisée : setup.ts se connecte à MongoDB en mémoire
      JWT_SECRET: 'test-secret-key-at-least-32-characters', // le même que dans tests/helpers.ts
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
  esbuild: {
    target: 'node18',
  },
});