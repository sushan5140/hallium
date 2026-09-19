/**
 * Hallim uses plain CSS — the Hallium V4 system is authored as hand-written
 * CSS custom properties and rules, with no Tailwind directives anywhere in
 * app/globals.css.
 *
 * This file exists specifically to stop Next.js from inheriting the parent
 * repository's Tailwind PostCSS config. Declaring no plugins keeps the build
 * byte-faithful to the V4 reference stylesheets.
 */
const config = {
  plugins: {},
};

export default config;
