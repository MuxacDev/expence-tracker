import { Query } from '@nestjs/cqrs';
import type { UserRecord } from './user-record';

export class GetUserByEmailQuery extends Query<UserRecord | null> {
  constructor(readonly email: string) {
    super();
  }
}
