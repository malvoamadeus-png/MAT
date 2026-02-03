import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(32, 32, 32)",
        accent: "rgb(230, 102, 64)"
      }
    }
  },
  plugins: []
} satisfies Config;
