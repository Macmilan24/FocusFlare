import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Nunito", ...defaultTheme.fontFamily.sans],
        body: ["Poppins", ...defaultTheme.fontFamily.sans],
        sans: ["Poppins", ...defaultTheme.fontFamily.sans], // Make Poppins the default sans-serif
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
        // Kid-specific theme colors (can be used with text-primary-kid, bg-secondary-kid etc.)
        "primary-kid": {
          DEFAULT: "hsl(var(--primary-kid))",
          foreground: "hsl(var(--primary-kid-foreground))",
        },
        "secondary-kid": {
          DEFAULT: "hsl(var(--secondary-kid))",
          foreground: "hsl(var(--secondary-kid-foreground))",
        },
        "accent-kid": {
          DEFAULT: "hsl(var(--accent-kid))",
          foreground: "hsl(var(--accent-kid-foreground))",
        },
        "muted-kid": {
          DEFAULT: "hsl(var(--muted-kid))",
          foreground: "hsl(var(--muted-kid-foreground))",
        },
        "card-kid": {
          DEFAULT: "hsl(var(--card-kid))",
          foreground: "hsl(var(--card-kid-foreground))",
        },
        "background-kid": "hsl(var(--background-kid))",
        "foreground-kid": "hsl(var(--foreground-kid))",
        "border-kid": "hsl(var(--border-kid))",
      },
      backgroundImage: {
        "kid-pattern": "url('/patterns/background-pattern.svg')",
        "topography-pattern": "url('/patterns/topography.svg')",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-bob": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-3px) scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-bob": "pulse-bob 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
  safelist: [
    // Safelist all dynamic border and background colors used in course cards
    "border-t-cyan-400",
    "border-t-blue-400",
    "border-t-green-400",
    "border-t-pink-400",
    "border-t-yellow-400",
    "border-t-purple-400",
    "border-t-orange-400",
    "bg-cyan-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-pink-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-orange-400",
  ],
};

export default config;
