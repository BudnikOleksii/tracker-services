import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { USER_ROLES, COUNTRY_CODES, CURRENCY_CODES } from '@tracker/database';
import type { AuthUser, Nullable } from '@tracker/shared';
import type { UserRole, CountryCode, CurrencyCode } from '@tracker/database';

export class UserResponseDto implements AuthUser {
  @ApiProperty({
    description: 'User ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'Whether the email is verified',
    example: true,
  })
  @Expose()
  emailVerified!: boolean;

  @ApiProperty({
    description: 'Country code',
    enum: COUNTRY_CODES,
    enumName: 'CountryCode',
    example: 'US',
    nullable: true,
  })
  @Expose()
  countryCode!: Nullable<CountryCode>;

  @ApiProperty({
    description: 'Base currency code',
    enum: CURRENCY_CODES,
    enumName: 'CurrencyCode',
    example: 'USD',
    nullable: true,
  })
  @Expose()
  baseCurrencyCode!: Nullable<CurrencyCode>;

  @ApiProperty({
    description: 'User role',
    enum: USER_ROLES,
    enumName: 'UserRole',
    example: 'USER',
  })
  @Expose()
  role!: UserRole;

  @ApiProperty({
    description: 'Creation date',
    type: Date,
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    type: Date,
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;

  @ApiHideProperty()
  @Exclude()
  passwordHash!: string;

  @ApiHideProperty()
  @Exclude()
  emailVerificationToken!: Nullable<string>;

  @ApiHideProperty()
  @Exclude()
  emailVerificationTokenExpiresAt!: Nullable<Date>;

  @ApiHideProperty()
  @Exclude()
  ipAddress!: Nullable<string>;

  @ApiHideProperty()
  @Exclude()
  userAgent!: Nullable<string>;

  @ApiHideProperty()
  @Exclude()
  deletedAt!: Nullable<Date>;
}
