import nestjsConfig from '@tracker/eslint-config/nestjs';

export default [
  ...nestjsConfig,
  {
    rules: {
      'no-barrel-files/no-barrel-files': 'off',
    },
  },
];
