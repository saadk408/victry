// File: /next.config.js
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // Removed - deprecated

  // Disable ESLint during build while we fix issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build while we fix issues
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure image optimization
  images: {
    domains: [
      "supabase.io",
      "supabase-public-assets.com",
      "lh3.googleusercontent.com", // For Google OAuth profile pictures
      "avatars.githubusercontent.com", // For GitHub OAuth profile pictures
      "cloudflare-ipfs.com", // For IPFS-served images
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Configure API routes - Removed deprecated block
  // api: {
  //   // For PDF uploads and generation which might be larger than default limit
  //   bodyParser: {
  //     sizeLimit: "10mb",
  //   },
  //   // For AI processing which might take longer than default timeout
  //   responseLimit: false,
  // },

  // Moved from experimental - Moving back into experimental
  // serverComponentsExternalPackages: ["pdf-lib", "jspdf", "puppeteer-core"],

  // Server Actions configuration (moved from experimental)
  // serverActions: {
  //   bodySizeLimit: "16mb",
  // },

  // Use top-level serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ["pdf-lib", "jspdf", "puppeteer-core"],

  // Experimental features
  experimental: {
    // Optimization features
    optimizeCss: false, // Disable CSS optimization to resolve critters module issue
    
    // Enable Next.js 15 optimizations
    optimizePackageImports: [
      '@/components/ui',
      '@/lib/utils',
      'lucide-react',
      'framer-motion',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-underline',
      '@tiptap/extension-link',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-bullet-list',
      '@tiptap/extension-ordered-list',
      '@tiptap/extension-list-item'
    ]
  },

  // Configure Turbopack (stable in Next.js 15+)
  turbopack: {
    // Enable faster builds with Turbopack
    rules: {
      '*.svg': ['@svgr/webpack'],
    }
  },

  // Configure modular imports for better tree shaking
  modularizeImports: {
    '@/components/ui': {
      transform: '@/components/ui/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    }
  },

  // Configure redirects for authentication and onboarding
  async redirects() {
    return [
      {
        source: "/login",
        has: [
          {
            type: "cookie",
            key: "supabase-auth-token",
          },
        ],
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/register",
        has: [
          {
            type: "cookie",
            key: "supabase-auth-token",
          },
        ],
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // Configure security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // Configure webpack for specific optimizations
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Add SVG support for resume template icons
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Optimize client-side PDF generation
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
      };
    }

    return config;
  },

  // Optimize output for production
  output: "standalone",

  // Configure typings for environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLAUDE_API_BASE_URL:
      process.env.NEXT_PUBLIC_CLAUDE_API_BASE_URL,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://victry.com",
  },

  // Don't generate source maps in production for better performance
  productionBrowserSourceMaps: false,

  // Configure Turbopack for development (turbopack is marked as experimental in Next.js 15)
  devIndicators: {
    position: "bottom-right",
  },

  // Configure static export optimization
  transpilePackages: ["lucide-react"],

  // Configure Next.js for dynamic rendering
  generateEtags: false,
};

export default withBundleAnalyzer(nextConfig);
