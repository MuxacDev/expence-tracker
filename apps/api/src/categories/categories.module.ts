import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { CategoryExistsHandler } from './handlers/category-exists.handler';

// Ничего не экспортирует: другие модули (transactions) общаются с categories через QueryBus
// и классы сообщений из ./contracts.
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService, CategoryExistsHandler],
})
export class CategoriesModule {}
