/** @type {import('tailwindcss').Config} */
// module.exports 대신 export default 사용
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#8056A5",        // 더 진한 보라색
        secondary: "#B088D9",      // 중간 진한 보라색
        accent: "#553A99",         // 짙은 보라색
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            transform: "translateX(0%) translateY(0%)",
          },
          "25%": {
            transform: "translateX(10%) translateY(-5%)",
          },
          "50%": {
            transform: "translateX(-5%) translateY(10%)",
          },
          "75%": {
            transform: "translateX(5%) translateY(-10%)",
          },
        },
        "float": {
          "0%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
          "100%": {
            transform: "translateY(0px)",
          },
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
      },
    },
  },
  // DaisyUI 설정
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#8056A5",
          "secondary": "#B088D9",
          "accent": "#553A99",
          "neutral": "#E8E1F2",
          "base-100": "#F9F5FF",
          "info": "#6A4C99",
          "success": "#4CAF50",
          "warning": "#FF9800",
          "error": "#F44336",
        },
      },
      "dark",
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
  },
  plugins: [
    require("daisyui")
  ],
}; 