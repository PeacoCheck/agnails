import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.agnails.ru' }], destination: 'https://agnails.ru/:path*', permanent: true },
      { source: '/prices', destination: '/#prices', permanent: true },
      { source: '/price', destination: '/#prices', permanent: true },
      { source: '/prajs', destination: '/#prices', permanent: true },
      { source: '/works', destination: '/#works', permanent: true },
      { source: '/reviews', destination: '/#reviews', permanent: true },
      { source: '/location', destination: '/#location', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
