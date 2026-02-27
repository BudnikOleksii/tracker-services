import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { CountryCode, CurrencyCode } from '@tracker/database';
import { COUNTRY_CODES, CURRENCY_CODES } from '@tracker/database';

export class UpdateUserDto {
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
