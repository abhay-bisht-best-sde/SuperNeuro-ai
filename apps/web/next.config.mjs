import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "favicon.im", pathname: "/**" },
      { protocol: "https", hostname: "img.icons8.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.simpleicons.org", pathname: "/**" },
    ],
  },
}

export default nextConfig
