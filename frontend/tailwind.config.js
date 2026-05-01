export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Don't break existing SaaS css
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
