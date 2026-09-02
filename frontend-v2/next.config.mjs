/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8003").replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    if (process.env.BACKEND_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: "/store",
          destination: `${backendUrl}/`,
        },
        {
          source: "/store/:path*",
          destination: `${backendUrl}/:path*`,
        },
      ];
    }

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
