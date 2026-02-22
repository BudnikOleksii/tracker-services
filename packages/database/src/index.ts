import {
  users,
  refreshTokens,
  transactionCategories,
  transactions,
} from './schema';

export {
  userRoleEnum,
  transactionTypeEnum,
  countryCodeEnum,
  currencyCodeEnum,
  users,
  usersRelations,
  refreshTokens,
  refreshTokensRelations,
  transactionCategories,
  transactionCategoriesRelations,
  transactions,
  transactionsRelations,
} from './schema';

export { type DrizzleDB, createDrizzleClient } from './client';

export {
  DatabaseModule,
  DRIZZLE,
  type DatabaseModuleAsyncOptions,
} from './database.module';

export {
  eq,
  ne,
  and,
  or,
  not,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  sql,
  asc,
  desc,
  count,
  sum,
  avg,
  min,
  max,
} from 'drizzle-orm';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type TransactionCategory = typeof transactionCategories.$inferSelect;
export type NewTransactionCategory = typeof transactionCategories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
