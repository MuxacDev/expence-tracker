import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../contracts';
import { UsersService } from '../users.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly users: UsersService) {}

  execute({ email, name, passwordHash }: CreateUserCommand) {
    return this.users.create({ email, name, passwordHash });
  }
}
