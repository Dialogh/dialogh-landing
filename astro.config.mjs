import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";
import partytown from "@astrojs/partytown";

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    playformCompress(),
  ],
});
