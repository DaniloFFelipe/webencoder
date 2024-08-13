import { Module } from '@nestjs/common';
import { Storage } from './storage';
import { S3Storage } from './s3-storage';

@Module({
  providers: [
    {
      provide: Storage,
      useClass: S3Storage,
    },
  ],
  exports: [Storage],
})
export class StorageModule {}
