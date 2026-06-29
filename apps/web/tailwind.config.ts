import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        mist: "#f5f7fb",
        line: "#d9e0ea",
        forest: "#22543d",
        coral: "#b4533a",
        gold: "#b7791f"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(24, 33, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
