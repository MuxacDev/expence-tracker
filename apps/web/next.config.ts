import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@expense-tracker/shared'],
};

export default nextConfig;
