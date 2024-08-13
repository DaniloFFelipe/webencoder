import { Job } from 'bull';
import { TranscoderService } from './transcoder.service';
import { TranscodeDto } from './dtos/transcode.dto';
import { Process, Processor } from '@nestjs/bull';

@Processor('transcoder')
export class TranscoderConsumer {
  constructor(private readonly transcoderService: TranscoderService) {}

  @Process()
  async transcode(job: Job<TranscodeDto>) {
    try {
      await this.transcoderService.transcode(job.data);
    } catch {
      await this.transcoderService.failure(job.data.assetId, job.data.callback);
    }
  }
}
