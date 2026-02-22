/* eslint-disable no-console */
import { sql } from 'drizzle-orm';

import { DrizzleDB } from '../client';
import { TransactionData } from './types';

interface CategoryRow extends Record<string, unknown> {
  id: string;
  userId: string;
  name: string;
  type: string;
  parentCategoryId: string | null;
}

async function findCategory(
  db: DrizzleDB,
  userId: string,
  name: string,
  parentCategoryId?: string,
): Promise<CategoryRow | undefined> {
  const result = parentCategoryId
    ? await db.execute<CategoryRow>(
        sql`SELECT * FROM "TransactionCategory" WHERE "userId" = ${userId} AND "name" = ${name} AND "parentCategoryId" = ${parentCategoryId} LIMIT 1`,
      )
    : await db.execute<CategoryRow>(
        sql`SELECT * FROM "TransactionCategory" WHERE "userId" = ${userId} AND "name" = ${name} AND "parentCategoryId" IS NULL LIMIT 1`,
      );

  return result.rows[0];
}

async function insertCategory(
  db: DrizzleDB,
  params: {
    userId: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    parentCategoryId?: string;
  },
): Promise<CategoryRow> {
  const result = await db.execute<CategoryRow>(
    sql`INSERT INTO "TransactionCategory" ("userId", "name", "type", "parentCategoryId") VALUES (${params.userId}, ${params.name}, ${params.type}, ${params.parentCategoryId ?? null}) RETURNING *`,
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Failed to insert category: ${params.name}`);
  }

  return row;
}

async function createCategory(
  db: DrizzleDB,
  params: {
    userId: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    parentCategoryId?: string;
  },
): Promise<CategoryRow> {
  const categoryLevel = params.parentCategoryId ? 'subcategory' : 'category';

  const existingCategory = await findCategory(
    db,
    params.userId,
    params.name,
    params.parentCategoryId,
  );

  if (existingCategory) {
    console.log(`Found existing ${categoryLevel}: ${params.name}`);

    return existingCategory;
  }

  const category = await insertCategory(db, params);
  console.log(`Created ${categoryLevel}: ${params.name} (${params.type})`);

  return category;
}

export async function createCategories(
  db: DrizzleDB,
  userId: string,
  transactionsData: TransactionData[],
): Promise<{
  createdCategories: Map<string, string>;
  createdSubcategories: Map<string, string>;
}> {
  console.log('Creating categories and subcategories...');

  const categoryMap = new Map<
    string,
    { type: 'INCOME' | 'EXPENSE'; subcategories: Set<string> }
  >();

  transactionsData.forEach((transaction) => {
    const categoryName = transaction.Category;
    const type =
      transaction.Type === 'Income'
        ? ('INCOME' as const)
        : ('EXPENSE' as const);

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { type, subcategories: new Set() });
    }

    if (transaction.Subcategory) {
      categoryMap.get(categoryName)?.subcategories.add(transaction.Subcategory);
    }
  });

  const createdCategories = new Map<string, string>();
  const createdSubcategories = new Map<string, string>();

  for (const [categoryName, { type, subcategories }] of categoryMap) {
    const category = await createCategory(db, {
      userId,
      name: categoryName,
      type,
    });
    createdCategories.set(categoryName, category.id);

    for (const subcategoryName of subcategories) {
      const subcategory = await createCategory(db, {
        userId,
        name: subcategoryName,
        type,
        parentCategoryId: category.id,
      });
      createdSubcategories.set(subcategoryName, subcategory.id);
    }
  }

  return { createdCategories, createdSubcategories };
}
