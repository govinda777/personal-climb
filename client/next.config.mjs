/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/personal-climb',
  trailingSlash: true,
};

export default nextConfig;
