import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../contracts';
import { UsersService } from '../users.service';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly users: UsersService) {}

  async execute({ id }: GetUserByIdQuery) {
    const user = await this.users.findById(id);
    return user ? this.users.toPublic(user) : null;
  }
}
