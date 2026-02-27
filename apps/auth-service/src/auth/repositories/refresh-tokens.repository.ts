import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE,
  type DrizzleDB,
  refreshTokens,
  eq,
  and,
  isNull,
  type RefreshToken,
  type NewRefreshToken,
} from '@tracker/database';

@Injectable()
export class RefreshTokensRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await this.db
      .insert(refreshTokens)
      .values(data)
      .returning();

    return token as RefreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | undefined> {
    const [record] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    return record;
  }

  async revokeByToken(token: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  async markReplaced(oldTokenId: string, newTokenId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ replacedByTokenId: newTokenId })
      .where(eq(refreshTokens.id, oldTokenId));
  }
}
