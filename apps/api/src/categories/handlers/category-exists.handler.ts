import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { CategoryExistsQuery } from '../contracts';
import { CategoriesRepository } from '../categories.repository';

@QueryHandler(CategoryExistsQuery)
export class CategoryExistsHandler implements IQueryHandler<CategoryExistsQuery> {
  constructor(private readonly categories: CategoriesRepository) {}

  execute({ id, userId }: CategoryExistsQuery) {
    return this.categories.existsForUser(id, userId);
  }
}
