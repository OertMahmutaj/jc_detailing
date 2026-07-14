/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfmake"],

  images: {
    qualities: [60, 70, 75, 85],
  },
};

export default nextConfig;