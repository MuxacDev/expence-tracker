import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

// Ничего не экспортирует. Когда категории понадобятся другим модулям (траты),
// добавим contracts/ с командами/запросами, как в users.
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService],
})
export class CategoriesModule {}
