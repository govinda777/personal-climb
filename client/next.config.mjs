/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure that the base path is correct for GitHub Pages if needed
  // basePath: '/PersonalClimb',
};

export default nextConfig;
