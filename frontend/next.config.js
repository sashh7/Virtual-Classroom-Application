/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // ✅ Ensure the app router is enabled
    bodySizeLimit: "150mb",
  },
};
  
  module.exports = nextConfig; // ✅ Use `module.exports` instead of `export default`
  