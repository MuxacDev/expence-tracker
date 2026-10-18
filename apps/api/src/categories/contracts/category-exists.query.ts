import { Query } from '@nestjs/cqrs';

/** true, если категория существует и принадлежит пользователю. Чужая неотличима от отсутствующей. */
export class CategoryExistsQuery extends Query<boolean> {
  constructor(
    readonly id: string,
    readonly userId: string,
  ) {
    super();
  }
}
