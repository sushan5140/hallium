/** @type {import('next').NextConfig} */
const nextConfig = {
  // Resolve packages and styles from this standalone application root.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
