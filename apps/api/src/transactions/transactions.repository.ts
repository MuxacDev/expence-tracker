import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  Transaction as TransactionRecord,
  TransactionType,
} from '@expense-tracker/db';
import { PrismaService } from '../prisma/prisma.service';

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
}

export type TransactionCreateData = Omit<Prisma.TransactionUncheckedCreateInput, 'userId'>;
export type TransactionUpdateData = Omit<Prisma.TransactionUncheckedUpdateInput, 'userId'>;

// Каждый запрос фильтруется по userId: чужая транзакция для репозитория не существует.
@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(userId: string, filters: TransactionFilters): Promise<TransactionRecord[]> {
    return this.prisma.client.transaction.findMany({
      where: {
        userId,
        type: filters.type,
        categoryId: filters.categoryId,
        date: { gte: filters.dateFrom, lte: filters.dateTo },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findOne(id: string, userId: string): Promise<TransactionRecord | null> {
    return this.prisma.client.transaction.findFirst({ where: { id, userId } });
  }

  create(userId: string, data: TransactionCreateData): Promise<TransactionRecord> {
    return this.prisma.client.transaction.create({ data: { ...data, userId } });
  }

  update(id: string, userId: string, data: TransactionUpdateData): Promise<TransactionRecord> {
    return this.prisma.client.transaction.update({ where: { id, userId }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.client.transaction.delete({ where: { id, userId } });
  }

  /** Суммы по (категория, тип) за полуинтервал дат [from, to). */
  sumByCategory(userId: string, from: Date, to: Date) {
    return this.prisma.client.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: { userId, date: { gte: from, lt: to } },
      _sum: { amount: true },
    });
  }
}
