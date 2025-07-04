/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Add API configuration for larger file handling
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  // Add experimental features for better file handling
  experimental: {
    serverComponentsExternalPackages: ['exiftool-vendored'],
  },
};

export default nextConfig;