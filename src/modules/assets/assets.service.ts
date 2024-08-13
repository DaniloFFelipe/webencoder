import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { env } from 'src/common/env';
import { PrismaService } from 'src/common/database/prisma.service';
import { Queue } from 'bull';
import { TranscodeDto } from '../transcoder/dtos/transcode.dto';
import { InjectQueue } from '@nestjs/bull';
import { Storage } from 'src/common/storage/storage';
import { rm } from 'fs/promises';
import { resolve } from 'path';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  constructor(
    private prisma: PrismaService,
    private storage: Storage,
    @InjectQueue('transcoder') private transcoderQueue: Queue<TranscodeDto>,
  ) {}

  async createAsset({ fileName, storageLocation, callback }: CreateAssetDto) {
    const { assetFileName, tmpLocation } = await this.storage.loadFile(
      storageLocation,
      fileName,
    );

    const asset = await this.prisma.asset.create({
      data: {
        orignalFileName: fileName,
        fileName: assetFileName,
        rawLocation: storageLocation,
      },
    });

    await this.transcoderQueue.add({
      assetId: asset.id,
      tmpLocation,
      callback,
    });
  }

  async getAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id,
      },
    });

    if (!asset) {
      throw new BadRequestException('Invalid asset');
    }

    return {
      asset: {
        id: asset.id,
        originalFileName: asset.orignalFileName,
        fileName: asset.fileName,
        rawLocation: asset.rawLocation,
        encodedLocation: asset.encodedLocation,
        streamUrl: `${env.APPLICATION_ENDPOINT}/assets/${asset.id}/stream`,
        status: asset.status,
        createdAt: asset.createdAt,
      },
    };
  }

  async listAssets(pageIndex: number, perPage: number) {
    const [data, total] = await Promise.all([
      await this.prisma.asset.findMany({
        take: perPage,
        skip: pageIndex * perPage,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      await this.prisma.asset.count({
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);
    const hasNext = total / perPage > pageIndex + 1;
    return {
      meta: {
        total,
        nextPageIndex: hasNext ? pageIndex + 1 : null,
      },
      data: data.map((a) => {
        return {
          id: a.id,
          originalFileName: a.orignalFileName,
          fileName: a.fileName,
          rawLocation: a.rawLocation,
          encodedLocation: a.encodedLocation,
          streamUrl: `${env.APPLICATION_ENDPOINT}/assets/${a.id}/stream`,
          status: a.status,
          createdAt: a.createdAt,
        };
      }),
    };
  }

  async deleteAsset(id: string) {
    const { asset } = await this.getAsset(id);
    const streamPath = resolve(
      process.cwd(),
      'static',
      asset.encodedLocation.substring(1).replace('/index.m3u8', ''),
    );

    this.logger.debug(streamPath);

    await rm(streamPath, { recursive: true, force: true });
    await this.prisma.asset.delete({
      where: {
        id: asset.id,
      },
    });
  }

  async uploadToStorage(assetId: string) {
    const { asset } = await this.getAsset(assetId);
    await this.storage.uploadFolder(
      resolve(
        process.cwd(),
        'static',
        asset.encodedLocation.substring(1).replace('/index.m3u8', ''),
      ),
      asset.encodedLocation.substring(1).replace('/index.m3u8', ''),
    );

    return { asset };
  }
}
