/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pinkFocused': '#f9ebffe6',
        'pinkUnFocused': '#ffffff26',
        'pinkHover': '#a06baf',
        'blueDark': '#0A264D',
        'blueLight': '#0C3064',
        'btn-light-color': '#134FA3',
        'btn-dark-color': '#5857A9',
        'light-color': '#B39CD0',
        'mediaBackgroundColor': '#A06BAF',
        'mediaPrimaryColor': '#B35BA8',
      },
      fontFamily: {
        pixel: ['thirteen-pixel-fonts', 'sans-serif'],
        pixelOriginal: ['pixel-fonts', 'sans-serif'],
        neuePixel: ['neue-pixel-font', 'sans-serif'],
        arcade: ['arcade-font', 'sans-serif'],
        gaming: ['gaming-font', 'sans-serif'],
        classic: ['classic-font', 'sans-serif'],
        astron: ['astron-boy', 'sans-serif'],
        astronWonder: ['astron-boy-wonder', 'sans-serif'],
        astronItalic: ['astron-boy-italic', 'sans-serif'],
        astronVideo: ['astron-boy-video', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
