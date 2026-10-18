import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Prisma, type Transaction as TransactionRecord } from '@expense-tracker/db';
import type {
  CreateTransactionInput,
  Transaction,
  TransactionQuery,
  TransactionSummary,
  TransactionSummaryQuery,
  UpdateTransactionInput,
} from '@expense-tracker/shared';
import { CategoryExistsQuery } from '../categories/contracts';
import { TransactionsRepository } from './transactions.repository';

// Колонка DATE: Prisma отдаёт и принимает её как полночь UTC.
function toDbDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toMoney(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactions: TransactionsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async findAll(userId: string, query: TransactionQuery): Promise<Transaction[]> {
    const records = await this.transactions.findMany(userId, {
      type: query.type,
      categoryId: query.categoryId,
      dateFrom: query.dateFrom === undefined ? undefined : toDbDate(query.dateFrom),
      dateTo: query.dateTo === undefined ? undefined : toDbDate(query.dateTo),
    });
    return records.map((record) => this.toPublic(record));
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const record = await this.transactions.findOne(id, userId);
    if (!record) throw new NotFoundException('Transaction not found');
    return this.toPublic(record);
  }

  async create(userId: string, input: CreateTransactionInput): Promise<Transaction> {
    await this.assertCategory(input.categoryId, userId);
    try {
      const record = await this.transactions.create(userId, {
        amount: input.amount,
        type: input.type,
        description: input.description ?? null,
        date: toDbDate(input.date),
        categoryId: input.categoryId,
      });
      return this.toPublic(record);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, userId: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.categoryId !== undefined) await this.assertCategory(input.categoryId, userId);
    try {
      // undefined Prisma пропускает, null в description обнуляет поле.
      const record = await this.transactions.update(id, userId, {
        amount: input.amount,
        type: input.type,
        description: input.description,
        date: input.date === undefined ? undefined : toDbDate(input.date),
        categoryId: input.categoryId,
      });
      return this.toPublic(record);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.transactions.delete(id, userId);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async summary(
    userId: string,
    { month, year }: TransactionSummaryQuery,
  ): Promise<TransactionSummary> {
    // Date.UTC сам переносит month=12 на январь следующего года.
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    const groups = await this.transactions.sumByCategory(userId, from, to);

    let income = new Prisma.Decimal(0);
    let expense = new Prisma.Decimal(0);
    const byCategory = groups
      .map((group) => {
        const total = group._sum.amount ?? new Prisma.Decimal(0);
        if (group.type === 'INCOME') income = income.plus(total);
        else expense = expense.plus(total);
        return { categoryId: group.categoryId, type: group.type, total };
      })
      .sort((a, b) => b.total.comparedTo(a.total))
      .map((item) => ({ ...item, total: toMoney(item.total) }));

    return {
      month,
      year,
      income: toMoney(income),
      expense: toMoney(expense),
      balance: toMoney(income.minus(expense)),
      byCategory,
    };
  }

  /** Категория из тела запроса должна существовать и принадлежать пользователю. */
  private async assertCategory(categoryId: string, userId: string): Promise<void> {
    const exists = await this.queryBus.execute(new CategoryExistsQuery(categoryId, userId));
    if (!exists) throw new UnprocessableEntityException('Category not found');
  }

  private mapError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Записи нет или она принадлежит другому пользователю — не различаем.
      if (error.code === 'P2025') {
        return new NotFoundException('Transaction not found');
      }
      // Категорию удалили между assertCategory и записью.
      if (error.code === 'P2003') {
        return new UnprocessableEntityException('Category not found');
      }
    }
    return error;
  }

  private toPublic(record: TransactionRecord): Transaction {
    return {
      id: record.id,
      amount: toMoney(record.amount),
      type: record.type,
      description: record.description,
      date: fromDbDate(record.date),
      categoryId: record.categoryId,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
