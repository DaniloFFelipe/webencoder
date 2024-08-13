import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTokensService } from './api-tokens.service';
import { AuthGuard } from 'src/common/auth/auth.guard';
import { CreateTokenDto, CreateTokenDtoSchema } from './dtos/create-token';
import { ZodValidationPipe } from 'src/common/validation/zod-validation-pipe';

@UseGuards(AuthGuard)
@Controller('api-tokens')
export class ApiTokensController {
  constructor(private service: ApiTokensService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTokenDtoSchema))
  async create(@Body() data: CreateTokenDto) {
    const apiToken = await this.service.createApiToken(data);
    return {
      apiToken,
    };
  }

  @HttpCode(204)
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    const apiToken = await this.service.deleteApiToken(id);
    return {
      apiToken,
    };
  }

  @Get()
  async list() {
    const apiTokens = await this.service.listApiTokens();
    return {
      apiTokens,
    };
  }
}
