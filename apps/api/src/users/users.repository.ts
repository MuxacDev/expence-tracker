import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UserRecord } from './contracts';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserRecord | null> {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.client.user.findUnique({ where: { email } });
  }

  create(data: Pick<UserRecord, 'email' | 'name' | 'passwordHash'>): Promise<UserRecord> {
    return this.prisma.client.user.create({ data });
  }
}
