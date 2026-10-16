import { Query } from '@nestjs/cqrs';
import type { User } from '@expense-tracker/shared';

export class GetUserByIdQuery extends Query<User | null> {
  constructor(readonly id: string) {
    super();
  }
}
