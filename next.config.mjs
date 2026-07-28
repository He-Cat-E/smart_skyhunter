/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF first (smaller than WebP) with WebP fallback; cache the
    // optimized variants for a day so repeat visits skip re-encoding.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    // Real portrait photos for story/member avatars are hosted online.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
    ],
  },
};

export default nextConfig;
