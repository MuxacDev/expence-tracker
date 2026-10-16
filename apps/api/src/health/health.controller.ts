import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { healthResponseSchema, type HealthResponse } from '@expense-tracker/shared';
import { createZodDto } from 'nestjs-zod';
import { Public } from '../auth/decorators/public.decorator';

class HealthResponseDto extends createZodDto(healthResponseSchema) {}

@Public()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
