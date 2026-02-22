/* eslint-disable no-console */
import { count, sql } from 'drizzle-orm';

import { createDrizzleClient } from '../client';
import { users, transactions } from '../schema';
import { loadTransactionData } from './data-loader';
import { createSuperAdminUser } from './user.seed';
import { createCategories } from './category.seed';
import { createTransactions } from './transaction.seed';

async function seedDatabase(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const { db, pool } = createDrizzleClient(connectionString);

  try {
    console.log('Starting database seeding...');

    console.log('Loading transaction data...');
    const transactionsData = loadTransactionData();
    console.log(`Loaded ${transactionsData.length} transactions`);

    const user = await createSuperAdminUser(db);

    const { createdCategories, createdSubcategories } = await createCategories(
      db,
      user.id,
      transactionsData,
    );

    await createTransactions(
      db,
      user.id,
      transactionsData,
      createdCategories,
      createdSubcategories,
    );

    console.log('Database seeding completed successfully!');

    const userRows = await db.select({ count: count() }).from(users);
    const categoryRows = await db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM "TransactionCategory"`,
    );
    const transactionRows = await db
      .select({ count: count() })
      .from(transactions);

    console.log('\nDatabase Summary:');
    console.log(`Users: ${String(userRows[0]?.count)}`);
    console.log(`Categories: ${String(categoryRows.rows[0]?.count)}`);
    console.log(`Transactions: ${String(transactionRows[0]?.count)}`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

void seedDatabase();
