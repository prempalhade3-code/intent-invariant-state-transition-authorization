/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8003/api/:path*",
      },
      {
        source: "/store",
        destination: "http://127.0.0.1:8000/",
      },
      {
        source: "/store/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
