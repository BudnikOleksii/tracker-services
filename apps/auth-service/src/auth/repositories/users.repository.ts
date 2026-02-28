import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE,
  type DrizzleDB,
  users,
  eq,
  and,
  isNull,
  type User,
  type NewUser,
} from '@tracker/database';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));

    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));

    return user;
  }

  async findByEmailVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(eq(users.emailVerificationToken, token), isNull(users.deletedAt)),
      );

    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();

    return user as User;
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      })
      .where(eq(users.id, userId));
  }
}
