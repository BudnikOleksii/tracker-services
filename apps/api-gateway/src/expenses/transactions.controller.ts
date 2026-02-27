import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  JwtAuthGuard,
  CurrentUser,
  PaginatedResponseDto,
} from '@tracker/shared';

import { SERVICES } from '../constants/services.constant';
import { sendWithTimeout } from '../utils/microservice.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionStatisticsQueryDto } from './dto/transaction-statistics-query.dto';
import { TransactionStatisticsResponseDto } from './dto/transaction-statistics-response.dto';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    @Inject(SERVICES.EXPENSES) private readonly expensesClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create transaction',
    description: 'Creates a new transaction',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return sendWithTimeout<TransactionResponseDto>(
      this.expensesClient,
      { cmd: 'create-transaction' },
      { userId: user.id, ...dto },
    );
  }

  @Get()
  @ApiExtraModels(PaginatedResponseDto, TransactionResponseDto)
  @ApiOperation({
    summary: 'Get all transactions',
    description:
      'Retrieves paginated list of transactions with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(TransactionResponseDto) },
        },
        total: { type: 'number', description: 'Total number of items' },
        page: { type: 'number', description: 'Current page number' },
        limit: { type: 'number', description: 'Items per page' },
      },
    },
  })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    return sendWithTimeout<PaginatedResponseDto<TransactionResponseDto>>(
      this.expensesClient,
      { cmd: 'find-all-transactions' },
      { userId: user.id, ...query },
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get transaction statistics',
    description: 'Retrieves aggregated statistics for transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: TransactionStatisticsResponseDto,
  })
  async getStatistics(
    @CurrentUser() user: { id: string },
    @Query() query: TransactionStatisticsQueryDto,
  ): Promise<TransactionStatisticsResponseDto> {
    return sendWithTimeout<TransactionStatisticsResponseDto>(
      this.expensesClient,
      { cmd: 'get-transaction-statistics' },
      { userId: user.id, ...query },
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves a specific transaction by its ID',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    return sendWithTimeout<TransactionResponseDto>(
      this.expensesClient,
      { cmd: 'find-one-transaction' },
      { userId: user.id, id },
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transaction',
    description: 'Updates an existing transaction',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return sendWithTimeout<TransactionResponseDto>(
      this.expensesClient,
      { cmd: 'update-transaction' },
      { userId: user.id, id, ...dto },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete transaction',
    description: 'Soft deletes a transaction',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiResponse({
    status: 204,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<void> {
    await sendWithTimeout(
      this.expensesClient,
      { cmd: 'remove-transaction' },
      { userId: user.id, id },
    );
  }
}
