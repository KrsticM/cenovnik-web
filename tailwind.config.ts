import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ecenovnik: {
          ink: "#393834",
          muted: "#77736d",
          paper: "#f7f3ec",
          card: "#fffdf9",
          line: "#e8dfd4",
          brand: "#925442",
          "brand-dark": "#713d30",
          "brand-soft": "#ead8ce",
        },
      },
      fontSize: {
        eyebrow: ["13px", { fontWeight: "800", letterSpacing: ".15em" }],
      },
      borderRadius: {
        card: "28px",
      },
      boxShadow: {
        "list-card": "0 24px 70px rgba(72, 49, 39, 0.11)",
        "brand-mark": "0 12px 30px rgba(113, 61, 48, 0.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;
