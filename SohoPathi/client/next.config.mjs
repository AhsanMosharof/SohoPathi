/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
