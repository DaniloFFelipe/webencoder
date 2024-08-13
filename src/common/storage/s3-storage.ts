import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { BadRequestException, Logger } from '@nestjs/common';
import { FileLocation, Storage } from './storage';
import { InjectS3, S3 } from 'nestjs-s3';
import { randomUUID } from 'crypto';
import * as mimeType from 'mime-types';
import { createReadStream, createWriteStream, WriteStream } from 'fs';
import { env } from '../env';
import { extname, relative, resolve } from 'path';
import { readdir } from 'fs/promises';

export class S3Storage implements Storage {
  private readonly logger = new Logger(Storage.name);
  constructor(@InjectS3() private readonly s3: S3) {}

  async uploadFile(file: MemoryStorageFile): Promise<FileLocation> {
    const mimeTypeRegex = /^(video|image)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(file.mimetype);

    if (!isValidFileFormat) {
      throw new BadRequestException('Invalid format');
    }

    const fileId = randomUUID();
    const extension = mimeType.extension(file.mimetype);
    if (!extension) {
      throw new BadRequestException('Invalid format');
    }

    const fileKey = fileId.concat('.').concat(extension);
    await this.s3.putObject({
      Bucket: 'musicify',
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    return {
      location: fileKey,
      fileName: fileKey,
    };
  }

  async loadFile(location: string, fileName: string) {
    const fileObject = await this.s3.getObject({
      Bucket: env.BUCKET_NAME,
      Key: location,
    });

    if (!fileObject.Body) {
      throw new BadRequestException('Invalid file');
    }

    const fileId = randomUUID();
    const extension = extname(fileName);

    const assetFileName = fileId.concat(extension);

    const byteArray = Buffer.from(await fileObject.Body.transformToByteArray());
    const tmpLocation = resolve(process.cwd(), 'static', 'tmp', assetFileName);
    const writeStream = createWriteStream(tmpLocation);
    await this.writeFile(writeStream, byteArray);

    return {
      tmpLocation,
      assetFileName,
    };
  }

  async uploadFolder(s3Path: string, path: string) {
    const files = (await this.getFiles(s3Path)) as string[];
    this.logger.debug(s3Path, path, files);

    const uploads = files.map((filePath) => {
      const key = filePath.replace(s3Path, `${path}`);
      this.logger.debug(key);
      // return Promise.resolve('');
      return this.s3.putObject({
        Key: key,
        Bucket: env.BUCKET_NAME,
        Body: createReadStream(filePath),
      });
    });
    await Promise.all(uploads);
  }

  private async getFiles(dir: string): Promise<string | string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFiles(res) : res;
      }),
    );
    return Array.prototype.concat(...files);
  }

  private async writeFile(stream: WriteStream, buffer: Buffer): Promise<void> {
    return await new Promise((resolve, reject) => {
      stream.write(buffer, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }
}
