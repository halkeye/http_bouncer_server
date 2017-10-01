module.exports = {
  extends: ["plugin:import/errors", "plugin:import/warnings", "standard"],
  plugins: ["standard", "promise", "import"],
  rules: {
    semi: [2, "always"],
    "no-var": "error"
  },
  env: {
    es6: true
  }
};
