module.exports = {
  root: false,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": "error"
  }
};
