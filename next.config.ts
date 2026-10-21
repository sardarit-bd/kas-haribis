import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Framework-level request body limit for App Router multipart/form-data requests.
      // Must accommodate the app's large PDF upload workflows (Bank Report PDFs up to 25 MB
      // plus multipart boundary overhead, and Seforim PDFs up to 30 MB).
      // Note: Inline report images are strictly validated and capped at exactly 1 MB (1,048,576 bytes)
      // at both the client-side level and the /api/admin/bank-report-image route handler.
      bodySizeLimit: '30mb',
    },
  },
};

export default nextConfig;
