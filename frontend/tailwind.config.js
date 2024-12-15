/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Pangolin", "Josefin Sans"], // Add the Google Font here
      },
      colors: {
        myGreen: "#59D936",
        lightMyGreen: "#ABEA99",
        ansGreen: "#4BCE27",
        skyBlue: "#30A8F2",
        borderBlue: "#113A8C",
      },
      flex: {
        2.5: "2.5",
        3: "3",
      },
    },
  },
  plugins: [],
};
