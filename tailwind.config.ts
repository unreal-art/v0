import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      textColor: {
        primary: {
          1: "var(--color-text-primary-1)",
          2: "var(--color-text-primary-2)",
          3: "var(--color-text-primary-3)",
          4: "var(--color-text-primary-4)",
          5: "var(--color-text-primary-5)",
          6: "var(--color-text-primary-6)",
          7: "var(--color-text-primary-7)",
          8: "var(--color-text-primary-8)",
          9: "var(--color-text-primary-9)",
          10: "var(--color-text-primary-10)",
          11: "var(--color-text-primary-11)",
          12: "var(--color-text-primary-12)",
          13: "var(--color-text-primary-13)",
        },
      },
      borderColor: {
        primary: {
          1: "var(--color-text-primary-1)",
          2: "var(--color-text-primary-2)",
          3: "var(--color-text-primary-3)",
          4: "var(--color-text-primary-4)",
          5: "var(--color-text-primary-5)",
          6: "var(--color-text-primary-6)",
          7: "var(--color-text-primary-7)",
          8: "var(--color-text-primary-8)",
          9: "var(--color-text-primary-9)",
          10: "var(--color-text-primary-10)",
          11: "var(--color-text-primary-11)",
          12: "var(--color-text-primary-12)",
          13: "var(--color-text-primary-13)",
        },
      },
      backgroundColor: {
        primary: {
          1: "var(--color-text-primary-1)",
          2: "var(--color-text-primary-2)",
          3: "var(--color-text-primary-3)",
          4: "var(--color-text-primary-4)",
          5: "var(--color-text-primary-5)",
          6: "var(--color-text-primary-6)",
          7: "var(--color-text-primary-7)",
          8: "var(--color-text-primary-8)",
          9: "var(--color-text-primary-9)",
          10: "var(--color-text-primary-10)",
          11: "var(--color-text-primary-11)",
          12: "var(--color-text-primary-12)",
          13: "var(--color-text-primary-13)",
        },
      },
      animation: {
        "infinite-scroll": "infinite-scroll 70s linear infinite",
        pulseWave: "pulseWave 1.5s infinite ease-in-out",
      },
      keyframes: {
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        pulseWave: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [],
  safelist: [],
} satisfies Config;
