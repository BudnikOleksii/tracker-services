import nestjsConfig from '@tracker/eslint-config/nestjs';

export default [
  ...nestjsConfig,
  {
    ignores: ["apps/**", "packages/**", "dist/**", "node_modules/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
