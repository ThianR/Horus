/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a",
                premium: {
                    blue: "#3b82f6",
                    purple: "#8b5cf6",
                }
            }
        },
    },
    plugins: [],
}
