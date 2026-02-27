import {
  users,
  refreshTokens,
  transactionCategories,
  transactions,
  countryCodeEnum,
  currencyCodeEnum,
  transactionTypeEnum,
  userRoleEnum,
} from './schema';

export {
  users,
  usersRelations,
  refreshTokens,
  refreshTokensRelations,
  transactionCategories,
  transactionCategoriesRelations,
  transactions,
  transactionsRelations,
} from './schema';

export type { DrizzleDB, createDrizzleClient } from './client';

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

export const TRANSACTION_TYPES = transactionTypeEnum.enumValues;
export const COUNTRY_CODES = countryCodeEnum.enumValues;
export const CURRENCY_CODES = currencyCodeEnum.enumValues;
export const USER_ROLES = userRoleEnum.enumValues;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type CountryCode = (typeof COUNTRY_CODES)[number];
export type CurrencyCode = (typeof CURRENCY_CODES)[number];
export type UserRole = (typeof USER_ROLES)[number];
