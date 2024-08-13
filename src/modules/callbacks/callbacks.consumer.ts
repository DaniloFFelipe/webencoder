import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AssetCallbackDto } from './dtos/asset-callback.dto';
import { CallbacksService } from './callbacks.service';

@Processor('callback')
export class CallbacksConsumer {
  constructor(private readonly service: CallbacksService) {}

  @Process('asset')
  async handler(job: Job<AssetCallbackDto>) {
    await this.service.sendAssetCallback(job.data);
  }
}
