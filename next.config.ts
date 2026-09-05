import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },

  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,

      // Prevent server-side code from pulling in the Node ONNX runtime.
      // The Background Remover runs with Transformers.js in the browser.
      ...(isServer
        ? {
            'onnxruntime-node$': false,
          }
        : {}),
    };

    // Disable Webpack's filesystem cache for production builds.
    // This prevents huge .next/cache/webpack/*.pack files.
    if (!dev) {
      config.cache = false;
    }

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