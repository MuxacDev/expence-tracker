import { Command } from '@nestjs/cqrs';
import type { UserRecord } from './user-record';

export class CreateUserCommand extends Command<UserRecord> {
  constructor(
    readonly email: string,
    readonly name: string,
    readonly passwordHash: string,
  ) {
    super();
  }
}
