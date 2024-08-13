import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PrismaService } from 'src/common/database/prisma.service';
import { CompleteDto } from './dtos/complete.dto';
import { TranscodeDto } from './dtos/transcode.dto';
import { HlsService } from 'src/common/hls';
import { unlink } from 'node:fs/promises';
import { AssetCallbackDto } from '../callbacks/dtos/asset-callback.dto';
import { env } from 'src/common/env';
import { Storage } from 'src/common/storage/storage';

@Injectable()
export class TranscoderService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('callback')
    private callbackQueue: Queue<AssetCallbackDto>,
    private hls: HlsService,
    private storage: Storage,
  ) {}

  async complete({ assetId, encodedLocation, callback }: CompleteDto) {
    const asset = await this.prisma.asset.update({
      where: {
        id: assetId,
      },
      data: {
        encodedLocation,
        status: 'DONE',
      },
    });

    if (callback) {
      await this.callbackQueue.add('asset', {
        payload: {
          id: asset.id,
          streamUrl: `${env.APPLICATION_ENDPOINT}/assets/${asset.id}/stream`,
          originalFileName: asset.orignalFileName,
          status: 'DONE',
        },
        callback,
      });
    }
  }

  async transcode({ assetId, tmpLocation, callback }: TranscodeDto) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: {
        id: assetId,
      },
    });
    const { outputLocation } = await this.hls.process({
      fileName: asset.fileName,
      inputPath: tmpLocation,
    });

    await unlink(tmpLocation);
    await this.complete({ assetId, encodedLocation: outputLocation, callback });

    // await this.storage.uploadFolder(outputLocation.replace('/index.m3u8', ''));
  }

  async failure(assetId: string, callback: string) {
    const asset = await this.prisma.asset.update({
      where: {
        id: assetId,
      },
      data: {
        status: 'FAIL',
      },
    });

    await this.callbackQueue.add('asset', {
      payload: {
        id: asset.id,
        streamUrl: null,
        originalFileName: asset.orignalFileName,
        status: 'FAIL',
      },
      callback,
    });
  }
}
