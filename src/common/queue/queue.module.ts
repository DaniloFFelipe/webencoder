import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { env } from '../env';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    }),
  ],
})
export class QueueModule {
  static forCallBack(): DynamicModule {
    return BullModule.registerQueue({
      name: 'callback',
    });
  }

  static forTranscoder(): DynamicModule {
    return BullModule.registerQueue({
      name: 'transcoder',
    });
  }
}
