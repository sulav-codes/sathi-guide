import sharedConfig from "@repo/tailwind-config";
import nativewindPreset from "nativewind/preset";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [nativewindPreset],
  plugins: [],
};
