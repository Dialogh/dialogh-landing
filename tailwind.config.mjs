import fluid, { extract } from "fluid-tailwind";
/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    extract,
  },
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Inter var", "system-ui", "sans-serif"],
      tickerbit: ["tickerbit", "sans-serif"],
      pp: ["PP Neue Montreal", "sans-serif"],
    },
  },
  plugins: [fluid],
};
