import { defineConfig } from 'drizzle-kit';

const DB_URL = process.env['DATABASE_URL'];

if (!DB_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});
