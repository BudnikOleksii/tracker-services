import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';

export const loginAttempts = pgTable(
  'LoginAttempt',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    attemptedAt: timestamp('attemptedAt', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    successful: boolean('successful').notNull(),
  },
  (table) => [
    index('LoginAttempt_userId_attemptedAt_idx').on(
      table.userId,
      table.attemptedAt,
    ),
  ],
);

export const loginAttemptsRelations = relations(loginAttempts, ({ one }) => ({
  user: one(users, {
    fields: [loginAttempts.userId],
    references: [users.id],
  }),
}));
