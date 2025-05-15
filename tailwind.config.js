// File: /tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
        fadeInUp: {
          from: {
            opacity: 0,
            transform: "translateY(20px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        fadeInLeft: {
          from: {
            opacity: 0,
            transform: "translateX(-20px)",
          },
          to: {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        pulseWidth: {
          from: {
            width: "30%",
          },
          to: {
            width: "100%",
          },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-up-delayed": "fadeInUp 0.6s ease-out 0.2s forwards",
        "fade-in-up-staggered-1": "fadeInUp 0.5s ease-out 0.1s forwards",
        "fade-in-up-staggered-2": "fadeInUp 0.5s ease-out 0.2s forwards",
        "fade-in-up-staggered-3": "fadeInUp 0.5s ease-out 0.3s forwards",
        "fade-in-up-staggered-4": "fadeInUp 0.5s ease-out 0.4s forwards",
        "fade-in-left": "fadeInLeft 0.6s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "float-delayed": "float 4s ease-in-out 1s infinite",
        "pulse-width": "pulseWidth 1.5s ease-in-out infinite alternate",
        "pulse-width-delayed-1": "pulseWidth 1.7s ease-in-out 0.2s infinite alternate",
        "pulse-width-delayed-2": "pulseWidth 1.6s ease-in-out 0.4s infinite alternate",
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      scale: {
        102: '1.02',
        98: '0.98',
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
