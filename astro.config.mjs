// @ts-check
import { defineConfig } from 'astro/config';

const REPO = '/sokolova-english';

export default defineConfig({
  site: 'https://sadshine11.github.io',
  base: REPO,
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { inlineStylesheets: 'auto', assets: '_assets' },
  vite: {
    build: { cssCodeSplit: false },
  },
});
