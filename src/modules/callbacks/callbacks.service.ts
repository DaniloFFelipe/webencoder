import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AssetCallbackDto } from './dtos/asset-callback.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class CallbacksService {
  private readonly logger = new Logger(CallbacksService.name);
  constructor(private readonly httpService: HttpService) {}

  async sendAssetCallback({ payload, callback }: AssetCallbackDto) {
    try {
      await firstValueFrom(
        this.httpService.post(callback, payload).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
      );

      this.logger.debug('SEND', { payload, callback });
    } catch (error) {}
  }
}
