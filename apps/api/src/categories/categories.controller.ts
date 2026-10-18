import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  type Category,
} from '@expense-tracker/shared';
import { createZodDto } from 'nestjs-zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types';
import { CategoriesService } from './categories.service';

class CreateCategoryDto extends createZodDto(createCategorySchema) {}
class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
class CategoryDto extends createZodDto(categorySchema) {}

// Защищён глобальным JwtAuthGuard.
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categories.create(user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: [CategoryDto] })
  findAll(@CurrentUser() user: AuthUser): Promise<Category[]> {
    return this.categories.findAll(user.id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoryDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categories.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  delete(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categories.delete(id, user.id);
  }
}
