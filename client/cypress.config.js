const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  experimentalStudio: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    excludeSpecPattern: "/node_modules",
    specPattern: [
      "./src/**/*.{cy,spec}.{js,jsx}",
      "./cypress/e2e/*.{cy,spec}.{js,jsx}",

    ],
    viewportHeight: 800,
    viewportWidth: 1200,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
