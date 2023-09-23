const path = require("path");
module.exports = {
  moduleNameMapper: {
    "@guide-mini-vue/(.*)$": path.resolve(__dirname, "packages") + "/$1/src",
  },
};
