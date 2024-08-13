import { Module } from '@nestjs/common';
import { DatabseModule } from './common/database/database.module';
import { AssetsModule } from './modules/assets/assets.module';
import { S3Module } from 'nestjs-s3';
import { env } from './common/env';
import { TranscoderModule } from './modules/transcoder/transcoder.module';
import { QueueModule } from './common/queue/queue.module';
import { CallbacksModule } from './modules/callbacks/callbacks.module';
import { ApiTokensModule } from './modules/api-tokens/api-tokens.module';

@Module({
  imports: [
    S3Module.forRoot({
      config: {
        credentials: {
          accessKeyId: env.STORAGE_AK,
          secretAccessKey: env.STORAGE_SK,
        },
        region: env.BUCKET_REGION,
        endpoint: env.STORAGE_ENDPOINT,
        forcePathStyle: true,
      },
    }),
    QueueModule,
    DatabseModule,
    AssetsModule,
    TranscoderModule,
    QueueModule,
    CallbacksModule,
    ApiTokensModule,
  ],
})
export class AppModule {}
