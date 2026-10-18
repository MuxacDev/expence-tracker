import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  createTransactionSchema,
  transactionQuerySchema,
  transactionSchema,
  transactionSummaryQuerySchema,
  transactionSummarySchema,
  updateTransactionSchema,
  type Transaction,
  type TransactionSummary,
} from '@expense-tracker/shared';
import { createZodDto } from 'nestjs-zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types';
import { TransactionsService } from './transactions.service';

class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
class UpdateTransactionDto extends createZodDto(updateTransactionSchema) {}
class TransactionQueryDto extends createZodDto(transactionQuerySchema) {}
class TransactionSummaryQueryDto extends createZodDto(transactionSummaryQuerySchema) {}
class TransactionDto extends createZodDto(transactionSchema) {}
class TransactionSummaryDto extends createZodDto(transactionSummarySchema) {}

// Защищён глобальным JwtAuthGuard.
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Post()
  @ApiCreatedResponse({ type: TransactionDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactions.create(user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: [TransactionDto] })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: TransactionQueryDto,
  ): Promise<Transaction[]> {
    return this.transactions.findAll(user.id, query);
  }

  // Должен идти раньше ':id', иначе "summary" уйдёт в ParseUUIDPipe и получит 400.
  @Get('summary')
  @ApiOkResponse({ type: TransactionSummaryDto })
  summary(
    @CurrentUser() user: AuthUser,
    @Query() query: TransactionSummaryQueryDto,
  ): Promise<TransactionSummary> {
    return this.transactions.summary(user.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: TransactionDto })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Transaction> {
    return this.transactions.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TransactionDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactions.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  delete(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.transactions.delete(id, user.id);
  }
}
