import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [TransactionsController, CategoriesController],
})
export class ExpensesModule {}
