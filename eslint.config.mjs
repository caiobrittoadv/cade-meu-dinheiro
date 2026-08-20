// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
  ignores: [
    "**/dist/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/*.gitkeep",
  ],
}, js.configs.recommended, ...tseslint.configs.recommended, {
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
}, storybook.configs["flat/recommended"]);
