import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  server: {
    host: true,
    port: 4321,
  },

  adapter: cloudflare(),
});