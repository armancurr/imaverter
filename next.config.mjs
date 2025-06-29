/** @type {import('next').NextConfig} */
const nextConfig = {
  // enable full static export on `next build`
  output: 'export',

  // if you need every route to produce its own index.html
  // uncomment the next line:
  // trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
