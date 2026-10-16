import { Module } from '@nestjs/common';
import { CreateUserHandler } from './handlers/create-user.handler';
import { GetUserByEmailHandler } from './handlers/get-user-by-email.handler';
import { GetUserByIdHandler } from './handlers/get-user-by-id.handler';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

// Ничего не экспортирует: другие модули общаются с users через CommandBus/QueryBus
// и классы сообщений из ./contracts.
@Module({
  providers: [
    UsersRepository,
    UsersService,
    CreateUserHandler,
    GetUserByEmailHandler,
    GetUserByIdHandler,
  ],
})
export class UsersModule {}
