import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Server Actions default to a 1MB request body limit. Several tools
    // (AI Headshot Generator, etc.) accept image uploads up to 4MB via
    // Server Actions, so without this the upload silently fails past 1MB
    // with a generic "unexpected response was received from the server"
    // error on the client.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  async redirects() {
    // These top-level routes are leftovers from the old iframe-embed architecture.
    // They're never linked internally (every link on the site points to /tools/<slug>)
    // and duplicate the content of their /tools/<slug> counterparts, so redirect them
    // permanently to consolidate ranking signals and avoid duplicate-content issues.
    return [
      { source: '/ai-humanizer', destination: '/tools/ai-humanizer', permanent: true },
      { source: '/free-qr-code-generator', destination: '/tools/free-qr-code-generator', permanent: true },
      { source: '/free-image-file-compressor', destination: '/tools/free-image-file-compressor', permanent: true },
      { source: '/free-cheat-sheet-generator', destination: '/tools/free-cheat-sheet-generator', permanent: true },
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