// enable vue in eslint

module.exports = {
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
  },
  plugins: ["vue"],
  extends: ["eslint:recommended", "plugin:vue/recommended", "prettier/vue"],
};
