import type { Config } from "tailwindcss";
const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
  content: [
    "./src/app/Pages/**/*.{js,ts,jsx,tsx}", // Include all files in the Pages directory
    "./src/app/Components/**/*.{js,ts,jsx,tsx}", // Include all files in the Components directory
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Include all files in the pages directory
    "./src/components/**/*.{js,ts,jsx,tsx}", // Include all files in the components directory
    "./src/styles/**/*.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});

export default config;
