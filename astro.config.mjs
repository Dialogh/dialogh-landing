// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    allowedHosts: true,
  },
  env: {
    schema: {
      DISCORD_WEBHOOK_URL: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
