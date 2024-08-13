import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { BullModule } from '@nestjs/bull';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transcoder',
    }),
    StorageModule,
  ],
  providers: [AssetsService],
  controllers: [AssetsController],
})
export class AssetsModule {}
