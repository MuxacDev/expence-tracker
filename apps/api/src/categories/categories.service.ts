import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Category as CategoryRecord } from '@expense-tracker/db';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@expense-tracker/shared';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categories: CategoriesRepository) {}

  async findAll(userId: string): Promise<Category[]> {
    const records = await this.categories.findAllByUser(userId);
    return records.map((record) => this.toPublic(record));
  }

  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    try {
      return this.toPublic(await this.categories.create(userId, data));
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, userId: string, data: UpdateCategoryInput): Promise<Category> {
    try {
      return this.toPublic(await this.categories.update(id, userId, data));
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.categories.delete(id, userId);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique (user_id, name).
      if (error.code === 'P2002') {
        return new ConflictException('Category with this name already exists');
      }
      // Записи нет или она принадлежит другому пользователю — не различаем.
      if (error.code === 'P2025') {
        return new NotFoundException('Category not found');
      }
    }
    return error;
  }

  private toPublic(record: CategoryRecord): Category {
    return {
      id: record.id,
      name: record.name,
      color: record.color,
      icon: record.icon,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
