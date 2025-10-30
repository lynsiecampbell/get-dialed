import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  safelist: [
    // Tag component color variants
    "bg-gray-100", "text-gray-700", "text-gray-500",
    "bg-blue-100", "text-blue-700",
    "bg-purple-100", "text-purple-700",
    "bg-teal-100", "text-teal-700",
    "bg-orange-100", "text-orange-700",
    "bg-green-100", "text-green-700",
    "bg-yellow-100", "text-yellow-700",
    "bg-gray-50", "text-gray-400",
    "bg-emerald-500", "bg-emerald-600",
    // Source tag variants
    "bg-blue-50", "bg-sky-50", "text-sky-700", "border-sky-200",
    "bg-yellow-50", "bg-red-50", "text-red-700", "border-red-200",
    "bg-pink-50", "text-pink-700", "border-pink-200",
    "border-blue-200", "border-yellow-200", "border-gray-200",
    // Medium tag variants
    "bg-purple-50", "bg-indigo-50", "text-indigo-700", "border-indigo-200",
    "bg-violet-50", "text-violet-700", "border-violet-200",
    "border-purple-200", "border-violet-200",
    // Type tag variants
    "bg-fuchsia-50", "text-fuchsia-700", "border-fuchsia-200",
    "bg-cyan-50", "text-cyan-700", "border-cyan-200",
    // Audience tag variants
    "bg-orange-50", "bg-amber-50", "text-amber-700", "border-amber-200",
    "bg-emerald-50", "text-emerald-700", "border-emerald-200",
    "border-orange-200",
    // Status tag variants
    "bg-green-50", "text-green-700", "border-green-200",
    // AssetCount component colors
    "text-cyan-600", "bg-cyan-50", "border-cyan-200",
    "text-violet-600", "bg-violet-50", "border-violet-200",
    "text-orange-600", "bg-orange-50", "border-orange-200",
    "text-gray-600", "bg-gray-50", "border-gray-200",
    "text-blue-600", "bg-blue-50", "border-blue-200",
    "text-purple-600", "bg-purple-50", "border-purple-200",
    "text-teal-600", "bg-teal-50", "border-teal-200",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'sm': '450px',
        'md': '850px',
        'lg': '1150px',
        'xl': '1350px',
        '2xl': '1650px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
