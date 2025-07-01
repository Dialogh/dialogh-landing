// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  server: {
    allowedHosts: true,
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify()
});