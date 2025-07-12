/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'raw.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
    ],
  },
  eslint: {
    // Disable ESLint during build temporarily since we have lots of warnings to fix
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
