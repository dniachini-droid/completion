import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/* `vite build --mode link` makes the web link: everything inlined into one page (scripts/single-page.mjs finishes it). */
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  build: mode === 'link'
    ? { outDir: 'dist-link', assetsInlineLimit: 10_000_000, cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } }
    : {},
  test: { include: ['tests/**/*.test.ts'] },
}));
