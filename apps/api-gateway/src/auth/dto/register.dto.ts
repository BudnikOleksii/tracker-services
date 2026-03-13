import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CountryCode, CurrencyCode } from '@tracker/database';
import { COUNTRY_CODES, CURRENCY_CODES } from '@tracker/database';
import { validatePasswordComplexity } from '@tracker/shared';

const PASSWORD_ERRORS_KEY = '__passwordErrors';

@ValidatorConstraint({ name: 'passwordComplexity', async: false })
class PasswordComplexityConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const result = validatePasswordComplexity(value);
    (args.object as Record<string, unknown>)[PASSWORD_ERRORS_KEY] =
      result.errors;

    return result.valid;
  }

  defaultMessage(args: ValidationArguments): string {
    const errors =
      ((args.object as Record<string, unknown>)[PASSWORD_ERRORS_KEY] as
        | string[]
        | undefined) ?? [];

    return errors.join('; ');
  }
}

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
  @Validate(PasswordComplexityConstraint)
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
