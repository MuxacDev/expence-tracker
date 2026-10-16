import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  type OnModuleInit,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@expense-tracker/shared';
import {
  CreateUserCommand,
  GetUserByEmailQuery,
  GetUserByIdQuery,
  type UserRecord,
} from '../users/contracts';
import type { JwtPayload } from './types';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService implements OnModuleInit {
  // Хэш-пустышка той же стоимости: login по несуществующему email тратит столько же времени,
  // что и по существующему, и по таймингу нельзя перебрать зарегистрированные адреса.
  private dummyHash!: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit() {
    this.dummyHash = await bcrypt.hash('dummy-password', BCRYPT_ROUNDS);
  }

  async register({ name, email, password }: RegisterInput): Promise<AuthResponse> {
    const existing = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.commandBus.execute(new CreateUserCommand(email, name, passwordHash));
    return this.buildResponse(user);
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));
    const valid = await bcrypt.compare(password, user?.passwordHash ?? this.dummyHash);
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user);
  }

  async me(userId: string): Promise<User> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private async buildResponse(user: UserRecord): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}
