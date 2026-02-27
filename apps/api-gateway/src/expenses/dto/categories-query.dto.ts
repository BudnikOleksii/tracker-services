import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { TransactionType } from '@tracker/database';
import { TRANSACTION_TYPES } from '@tracker/database';

export class CategoriesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter categories by transaction type',
    enum: TRANSACTION_TYPES,
    enumName: 'TransactionType',
    example: 'EXPENSE',
  })
  @IsOptional()
  @IsIn(TRANSACTION_TYPES)
  type?: TransactionType;
}
