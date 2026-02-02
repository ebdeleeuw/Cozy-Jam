/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./App.tsx", "./index.tsx", "./components/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      colors: {
        "cozy-cream": "#FDFBF7",
        "cozy-dark": "#4A403A",
        "cozy-pink": "#F4D9D0",
        "cozy-green": "#D9EAD3",
        "cozy-blue": "#D0E1F4",
        "cozy-yellow": "#F9E4B7",
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        "pulse-fast": "pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-up": "floatUp 2.5s ease-out forwards",
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "10%": { opacity: "1", transform: "translateY(-20px) scale(1)" },
          "100%": {
            transform: "translateY(-150px) scale(1.1) rotate(10deg)",
            opacity: "0",
          },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  safelist: [
    'bg-rose-200',
    'bg-sky-200',
    'bg-emerald-200',
    'bg-amber-200',
    'bg-violet-200',
    'text-rose-200',
    'text-sky-200',
    'text-emerald-200',
    'text-amber-200',
    'text-violet-200',
  ],
  plugins: [],
};
