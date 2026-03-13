import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE,
  type DrizzleDB,
  loginAttempts,
  eq,
  and,
  gte,
  desc,
  count,
  type NewLoginAttempt,
  type LoginAttempt,
} from '@tracker/database';

@Injectable()
export class LoginAttemptsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async recordAttempt(data: NewLoginAttempt): Promise<LoginAttempt> {
    const [attempt] = await this.db
      .insert(loginAttempts)
      .values(data)
      .returning();

    return attempt as LoginAttempt;
  }

  async getRecentFailedAttempts(
    userId: string,
    since: Date,
  ): Promise<LoginAttempt[]> {
    return this.db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.userId, userId),
          eq(loginAttempts.successful, false),
          gte(loginAttempts.attemptedAt, since),
        ),
      )
      .orderBy(desc(loginAttempts.attemptedAt));
  }

  async getConsecutiveFailedCount(userId: string): Promise<number> {
    const lastSuccess = await this.db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.userId, userId),
          eq(loginAttempts.successful, true),
        ),
      )
      .orderBy(desc(loginAttempts.attemptedAt))
      .limit(1);

    const sinceDate = lastSuccess[0]?.attemptedAt ?? new Date(0);

    const [result] = await this.db
      .select({ count: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.userId, userId),
          eq(loginAttempts.successful, false),
          gte(loginAttempts.attemptedAt, sinceDate),
        ),
      );

    return result?.count ?? 0;
  }
}
