import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard, CurrentUser } from '@tracker/shared';
import { TRANSACTION_TYPES } from '@tracker/database';
import type { TransactionType } from '@tracker/database';

import { SERVICES } from '../constants/services.constant';
import { sendWithTimeout } from '../utils/microservice.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    @Inject(SERVICES.EXPENSES) private readonly expensesClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create category',
    description: 'Creates a new transaction category',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return sendWithTimeout<CategoryResponseDto>(
      this.expensesClient,
      { cmd: 'create-category' },
      { userId: user.id, ...dto },
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieves all categories for the authenticated user, optionally filtered by transaction type',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TRANSACTION_TYPES,
    enumName: 'TransactionType',
    description: 'Filter by transaction type',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('type') type?: TransactionType,
  ): Promise<CategoryResponseDto[]> {
    return sendWithTimeout<CategoryResponseDto[]>(
      this.expensesClient,
      { cmd: 'find-all-categories' },
      { userId: user.id, type },
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a specific category by its ID',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<CategoryResponseDto> {
    return sendWithTimeout<CategoryResponseDto>(
      this.expensesClient,
      { cmd: 'find-one-category' },
      { userId: user.id, id },
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return sendWithTimeout<CategoryResponseDto>(
      this.expensesClient,
      { cmd: 'update-category' },
      { userId: user.id, id, ...dto },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Soft deletes a category',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<void> {
    await sendWithTimeout(
      this.expensesClient,
      { cmd: 'remove-category' },
      { userId: user.id, id },
    );
  }
}
