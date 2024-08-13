import { Module } from '@nestjs/common';
import { ApiTokensService } from './api-tokens.service';
import { ApiTokensController } from './api-tokens.controller';

@Module({
  providers: [ApiTokensService],
  controllers: [ApiTokensController],
})
export class ApiTokensModule {}
