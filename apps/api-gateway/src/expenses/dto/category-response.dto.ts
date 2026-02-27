import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import type { TransactionType } from '@tracker/database';
import { TRANSACTION_TYPES } from '@tracker/database';
import type { Nullable } from '@tracker/shared';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TRANSACTION_TYPES,
    enumName: 'TransactionType',
    example: 'EXPENSE',
  })
  @Expose()
  type!: TransactionType;

  @ApiProperty({
    description: 'Parent category ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Expose()
  parentCategoryId!: Nullable<string>;

  @ApiProperty({
    description: 'Parent category',
    type: CategoryResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => CategoryResponseDto)
  parentCategory!: Nullable<CategoryResponseDto>;

  @ApiProperty({
    description: 'Subcategories',
    type: [CategoryResponseDto],
  })
  @Expose()
  @Type(() => CategoryResponseDto)
  subcategories!: CategoryResponseDto[];

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
  userId!: string;

  @ApiHideProperty()
  @Exclude()
  deletedAt!: Nullable<Date>;
}
