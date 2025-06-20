// tailwind.config.ts - Victry Brand Color Update
// 
// This configuration adds all Victry brand colors to Tailwind
// while maintaining the existing OKLCH color system

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Victry Brand Colors
        victry: {
          // Primary Orange Palette
          orange: {
            DEFAULT: "oklch(0.70 0.20 39)",      // #FF6104
            dark: "oklch(0.63 0.19 39)",         // #EC5800
            mid: "oklch(0.65 0.18 39)",          // #EE6D00
            light: "oklch(0.92 0.06 39)",        // Light tint
            50: "oklch(0.98 0.02 39)",           // Lightest tint
            100: "oklch(0.95 0.04 39)",
            200: "oklch(0.92 0.06 39)",
            300: "oklch(0.85 0.10 39)",
            400: "oklch(0.78 0.15 39)",
            500: "oklch(0.70 0.20 39)",          // Base
            600: "oklch(0.65 0.18 39)",          // Mid
            700: "oklch(0.63 0.19 39)",          // Dark
            800: "oklch(0.55 0.17 39)",
            900: "oklch(0.45 0.15 39)",
          },
          // Teal Palette
          teal: {
            DEFAULT: "oklch(0.20 0.04 192)",     // #002624
            rich: "oklch(0.25 0.05 192)",        // #153335
            light: "oklch(0.35 0.04 192)",
            50: "oklch(0.95 0.01 192)",
            100: "oklch(0.90 0.02 192)",
            200: "oklch(0.80 0.03 192)",
            300: "oklch(0.65 0.04 192)",
            400: "oklch(0.45 0.04 192)",
            500: "oklch(0.25 0.05 192)",         // Rich
            600: "oklch(0.20 0.04 192)",         // Base
            700: "oklch(0.18 0.04 192)",
            800: "oklch(0.15 0.03 192)",
            900: "oklch(0.12 0.03 192)",
          },
          // Supporting Colors
          navy: "oklch(0.22 0.07 237)",          // #0E2647
          "blue-gray": "oklch(0.38 0.03 237)",   // #434F60
          gray: "oklch(0.28 0.01 0)",            // #2F2E2C
          cream: "oklch(0.97 0.02 70)",          // #FFF1E4
          brown: "oklch(0.30 0.08 50)",          // #3F2001
        },
        
        // Override default semantic colors with brand colors
        primary: "oklch(0.70 0.20 39)",          // Victry Orange
        secondary: "oklch(0.20 0.04 192)",       // Victry Teal
        accent: "oklch(0.92 0.06 39)",           // Light Orange
        background: "oklch(0.97 0.02 70)",       // Victry Cream
        foreground: "oklch(0.20 0.04 192)",      // Victry Teal
        
        // Component-specific overrides
        card: {
          DEFAULT: "oklch(1 0 0)",               // White
          foreground: "oklch(0.20 0.04 192)",   // Victry Teal
        },
        popover: {
          DEFAULT: "oklch(1 0 0)",               // White
          foreground: "oklch(0.20 0.04 192)",   // Victry Teal
        },
        muted: {
          DEFAULT: "oklch(0.38 0.03 237)",      // Victry Blue-Gray
          foreground: "oklch(0.38 0.03 237)",   // Victry Blue-Gray
        },
        destructive: {
          DEFAULT: "oklch(0.53 0.24 25)",       // Error Red
          foreground: "oklch(1 0 0)",           // White
        },
        border: "oklch(0.90 0.01 70)",          // Warm light border
        input: "oklch(0.88 0.01 70)",           // Warm input border
        ring: "oklch(0.70 0.20 39)",            // Victry Orange
      },
      
      // Brand-specific gradients
      backgroundImage: {
        "gradient-victry-primary": "linear-gradient(135deg, oklch(0.70 0.20 39) 0%, oklch(0.63 0.19 39) 100%)",
        "gradient-victry-hero": "linear-gradient(135deg, oklch(0.20 0.04 192) 0%, oklch(0.22 0.07 237) 100%)",
        "gradient-victry-warm": "linear-gradient(135deg, oklch(0.70 0.20 39) 0%, oklch(0.65 0.18 39) 50%, oklch(0.70 0.15 85) 100%)",
        "gradient-victry-cool": "linear-gradient(135deg, oklch(0.20 0.04 192) 0%, oklch(0.22 0.07 237) 50%, oklch(0.38 0.03 237) 100%)",
        "gradient-victry-surface": "linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.97 0.02 70) 100%)",
      },
      
      // Brand shadows
      boxShadow: {
        "victry-orange": "0 4px 6px -1px oklch(0.70 0.20 39 / 0.1), 0 2px 4px -2px oklch(0.70 0.20 39 / 0.05)",
        "victry-orange-lg": "0 10px 15px -3px oklch(0.70 0.20 39 / 0.1), 0 4px 6px -4px oklch(0.70 0.20 39 / 0.05)",
        "victry-teal": "0 4px 6px -1px oklch(0.20 0.04 192 / 0.1), 0 2px 4px -2px oklch(0.20 0.04 192 / 0.05)",
        "victry-teal-lg": "0 10px 15px -3px oklch(0.20 0.04 192 / 0.1), 0 4px 6px -4px oklch(0.20 0.04 192 / 0.05)",
        "victry-glow": "0 0 20px oklch(0.70 0.20 39 / 0.3)",
      },
      
      // Animation updates for brand
      animation: {
        "pulse-orange": "pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.3s ease-out",
        "slide-down-fade": "slide-down-fade 0.3s ease-out",
        "indeterminate-progress": "indeterminate-progress 1.5s linear infinite",
      },
      
      keyframes: {
        "pulse-orange": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 oklch(0.70 0.20 39 / 0.4)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 0 10px oklch(0.70 0.20 39 / 0)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px oklch(0.70 0.20 39 / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px oklch(0.70 0.20 39 / 0.5)",
          },
        },
        "slide-up-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-down-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      
      // Font family with Poppins
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
    },
  },
  plugins: [
    // Add any plugins here
  ],
};

export default config;