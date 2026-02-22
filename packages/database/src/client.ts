import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;

export function createDrizzleClient(connectionString: string): {
  db: DrizzleDB;
  pool: Pool;
} {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  return { db, pool };
}
