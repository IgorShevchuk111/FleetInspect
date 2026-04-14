import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb', // Increase the limit to 3MB
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ypzemkhznmmkuqkwsclm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

// Temporarily disable PWA to isolate issues
export default nextConfig;
