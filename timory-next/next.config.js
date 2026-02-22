/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Backend uploads: PORT_API (timory .env) bilan bir xil bo'lishi kerak
    const apiBase = (
      process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
      "http://localhost:3003/graphql"
    ).replace(/\/graphql.*$/, "");
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
