import {
  IsUUID,
  IsIn,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CurrencyCode, TransactionType } from '@tracker/database';
import { CURRENCY_CODES, TRANSACTION_TYPES } from '@tracker/database';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Category ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TRANSACTION_TYPES,
    enumName: 'TransactionType',
    example: 'EXPENSE',
  })
  @IsIn(TRANSACTION_TYPES)
  type!: TransactionType;

  @ApiProperty({
    description: 'Transaction amount as a positive number',
    example: 100.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({
    description: 'Currency code',
    enum: CURRENCY_CODES,
    enumName: 'CurrencyCode',
    example: 'USD',
  })
  @IsIn(CURRENCY_CODES)
  currencyCode!: CurrencyCode;

  @ApiProperty({
    description: 'Transaction date',
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Grocery shopping at supermarket',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
