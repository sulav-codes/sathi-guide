import * as sharedConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        icon: "var(--icon)",
        background: "var(--background)",
        card: "var(--card)",
        "active-card": "var(--active-card)",
        "inactive-card": "var(--inactive-card)",
        border: "var(--border)",
        muted: "var(--muted)",
        tint: "var(--tint)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        green: "var(--green)",
        orange: "var(--orange)",
      },
    },
  },
};
