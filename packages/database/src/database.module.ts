import {
  type DynamicModule,
  Global,
  Inject,
  Module,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');
const PG_POOL = Symbol('PG_POOL');

export interface DatabaseModuleAsyncOptions {
  imports?: unknown[];
  inject?: unknown[];
  useFactory: (
    ...args: never[]
  ) => { connectionString: string } | Promise<{ connectionString: string }>;
}

@Global()
@Module({})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      imports: (options.imports ?? []) as DynamicModule[],
      providers: [
        {
          provide: PG_POOL,
          inject: options.inject as [] | undefined,
          useFactory: async (...args: never[]) => {
            const config = await options.useFactory(...args);

            return new Pool({ connectionString: config.connectionString });
          },
        },
        {
          provide: DRIZZLE,
          inject: [PG_POOL],
          useFactory: (pool: Pool) => drizzle(pool, { schema }),
        },
      ],
      exports: [DRIZZLE],
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
