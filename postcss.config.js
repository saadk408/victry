// PostCSS Configuration for Tailwind v4 + OKLCH Support
// Based on tailwind-v4-spec.md and color-system-spec.md

module.exports = {
  plugins: {
    // Tailwind CSS v4 - CSS-first architecture
    '@tailwindcss/postcss': {},
    
    // OKLCH color function support with automatic RGB fallbacks
    '@csstools/postcss-oklab-function': {
      preserve: true, // Keep OKLCH for modern browsers
      subFeatures: { 
        displayP3: false // Use sRGB fallbacks for better compatibility
      }
    },
    
    // Modern CSS features support
    'postcss-preset-env': {
      stage: 3, // Stage 3 features (stable)
      features: {
        'nesting-rules': true, // Enable CSS nesting
        'custom-properties': false // Don't transform custom properties (Tailwind handles this)
      }
    },
    
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          colormin: false, // Don't optimize colors (preserve OKLCH)
          reduceTransforms: false // Don't optimize transforms
        }]
      }
    } : {})
  }
};