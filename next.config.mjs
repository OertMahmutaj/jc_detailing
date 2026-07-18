/** @type {import("next").NextConfig} */

const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = `
  default-src 'self';

  script-src
    'self'
    'unsafe-inline'
    ${isDevelopment ? "'unsafe-eval'" : ""}
    https://maps.googleapis.com
    https://maps.gstatic.com;

  style-src
    'self'
    'unsafe-inline';

  img-src
    'self'
    data:
    blob:
    https://maps.googleapis.com
    https://maps.gstatic.com
    https://www.google.com
    https://lh3.googleusercontent.com
    https://lh4.googleusercontent.com
    https://lh5.googleusercontent.com;

  media-src
    'self'
    blob:;

  font-src
    'self'
    data:;

  connect-src
    'self'
    https://maps.googleapis.com
    https://maps.gstatic.com
    https://www.google.com;

  frame-src
    https://www.google.com
    https://maps.google.com;

  object-src
    'none';

  base-uri
    'self';

  form-action
    'self';

  frame-ancestors
    'none';

  worker-src
    'self'
    blob:;

  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfmake"],

  images: {
    deviceSizes: [
      480,
      640,
      750,
      828,
      1080,
      1200,
      1920,
      2048,
      3840,
    ],
    qualities: [60, 70, 75, 85],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;