import { AssetStatus } from '@prisma/client';

export class AssetCallbackDto {
  payload: {
    id: string;
    originalFileName: string;
    streamUrl: string;
    status: AssetStatus;
  };
  callback: string;
}
