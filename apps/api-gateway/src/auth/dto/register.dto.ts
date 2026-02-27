import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CountryCode, CurrencyCode } from '@tracker/database';
import { COUNTRY_CODES, CURRENCY_CODES } from '@tracker/database';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Country code',
    enum: COUNTRY_CODES,
    enumName: 'CountryCode',
    example: 'US',
  })
  @IsOptional()
  @IsIn(COUNTRY_CODES)
  countryCode?: CountryCode;

  @ApiPropertyOptional({
    description: 'Base currency code',
    enum: CURRENCY_CODES,
    enumName: 'CurrencyCode',
    example: 'USD',
  })
  @IsOptional()
  @IsIn(CURRENCY_CODES)
  baseCurrencyCode?: CurrencyCode;
}
