import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'node:child_process';

const sha = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'dev'; } })();
const build = process.env.BUILD_NUMBER ? `${process.env.BUILD_NUMBER} · ${sha}` : sha;

// Relative base so the same build works from Netlify Drop, a file path and the iOS app.
export default defineConfig({
  base: './',
  plugins: [svelte()],
  define: { __BUILD__: JSON.stringify(build) },
  build: { target: 'safari16', assetsInlineLimit: 0 },
  test: { include: ['tests/**/*.test.ts'] },
});
