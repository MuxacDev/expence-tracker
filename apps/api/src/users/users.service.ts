import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@expense-tracker/db';
import type { User } from '@expense-tracker/shared';
import type { UserRecord } from './contracts';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  findById(id: string): Promise<UserRecord | null> {
    return this.users.findById(id);
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.findByEmail(email);
  }

  async create(data: Pick<UserRecord, 'email' | 'name' | 'passwordHash'>): Promise<UserRecord> {
    try {
      return await this.users.create(data);
    } catch (error) {
      // Гонка двух регистраций с одним email: unique constraint violation.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  toPublic(user: UserRecord): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
