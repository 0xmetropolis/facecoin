import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
    },
  }, 
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "pbs.twimg.com",
      //   port: "",
      //   pathname: "/**",
      //   search: "",
      // },
      // {
      //   protocol: "https",
      //   hostname: "replicate.delivery",
      //   port: "",
      //   pathname: "/**",
      //   search: "",
      // },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
