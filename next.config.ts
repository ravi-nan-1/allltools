import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node$': false,
    };

    return config;
  },

  async redirects() {
    return [
      {
        source: '/ai-humanizer',
        destination: '/tools/ai-humanizer',
        permanent: true,
      },
      {
        source: '/free-qr-code-generator',
        destination: '/tools/free-qr-code-generator',
        permanent: true,
      },
      {
        source: '/free-image-file-compressor',
        destination: '/tools/free-image-file-compressor',
        permanent: true,
      },
      {
        source: '/free-cheat-sheet-generator',
        destination: '/tools/free-cheat-sheet-generator',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;