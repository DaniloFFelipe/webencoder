import { Module } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';
import { TranscoderConsumer } from './transcoder.consumer';

import { QueueModule } from 'src/common/queue/queue.module';
import { HlsModule } from 'src/common/hls';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    HlsModule,
    QueueModule.forTranscoder(),
    QueueModule.forCallBack(),
    StorageModule,
  ],
  providers: [TranscoderService, TranscoderConsumer],
})
export class TranscoderModule {}
