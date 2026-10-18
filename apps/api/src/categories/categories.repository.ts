import { Injectable } from '@nestjs/common';
import type { Category as CategoryRecord } from '@expense-tracker/db';
import type { CreateCategoryInput, UpdateCategoryInput } from '@expense-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';

// Каждый запрос фильтруется по userId: чужая категория для репозитория не существует.
@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string): Promise<CategoryRecord[]> {
    return this.prisma.client.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async existsForUser(id: string, userId: string): Promise<boolean> {
    const record = await this.prisma.client.category.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    return record !== null;
  }

  create(userId: string, data: CreateCategoryInput): Promise<CategoryRecord> {
    return this.prisma.client.category.create({ data: { ...data, userId } });
  }

  update(id: string, userId: string, data: UpdateCategoryInput): Promise<CategoryRecord> {
    return this.prisma.client.category.update({ where: { id, userId }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.client.category.delete({ where: { id, userId } });
  }
}
