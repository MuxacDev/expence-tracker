import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { healthResponseSchema, type HealthResponse } from '@expense-tracker/shared';
import { createZodDto } from 'nestjs-zod';

class HealthResponseDto extends createZodDto(healthResponseSchema) {}

@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
