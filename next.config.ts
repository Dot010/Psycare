import type { NextConfig } from "next";

const forbiddenPublicServerVars = [
  "NEXT_PUBLIC_JWT_SECRET",
  "NEXT_PUBLIC_API_SECRET_KEY",
  "NEXT_PUBLIC_DATABASE_URL",
  "NEXT_PUBLIC_SENTRY_AUTH_TOKEN",
];

const leakedEnvVar = forbiddenPublicServerVars.find((envName) => Boolean(process.env[envName]));

if (leakedEnvVar) {
  throw new Error(`Variável sensível exposta em client bundle: ${leakedEnvVar}`);
}

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**', // Matches all paths on this domain
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;