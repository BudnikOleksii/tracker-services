import { registerAs } from '@nestjs/config';

import { emailConfigSchema, type EmailConfig } from './email.config';

export default registerAs<EmailConfig>('email', () => {
  const value = emailConfigSchema.validate(
    {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
    },
    {
      abortEarly: false,
    },
  );

  if (value.error) {
    throw value.error;
  }

  return value.value;
});
