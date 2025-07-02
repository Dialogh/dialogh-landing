// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

import netlify from "@astrojs/netlify";

import partytown from "@astrojs/partytown";

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
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
  integrations: [
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    playformCompress(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
