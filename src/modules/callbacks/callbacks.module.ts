import { Module } from '@nestjs/common';
import { QueueModule } from 'src/common/queue/queue.module';
import { CallbacksService } from './callbacks.service';
import { HttpModule } from '@nestjs/axios';
import { CallbacksConsumer } from './callbacks.consumer';

@Module({
  imports: [QueueModule.forCallBack(), HttpModule],
  providers: [CallbacksService, CallbacksConsumer],
})
export class CallbacksModule {}
