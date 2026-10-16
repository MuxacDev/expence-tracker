import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '../contracts';
import { UsersService } from '../users.service';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly users: UsersService) {}

  execute({ email }: GetUserByEmailQuery) {
    return this.users.findByEmail(email);
  }
}
