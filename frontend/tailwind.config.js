/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["Newsreader", "Georgia", "serif"],
      },
      colors: {
        ink: "#f4f1ea",
        mute: "#8a8680",
        line: "rgba(244,241,234,0.1)",
        ok: "#b7d7b0",
        bad: "#e08a7a",
      },
      letterSpacing: {
        mark: "0.18em",
      },
    },
  },
  plugins: [],
};
