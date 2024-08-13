import { Injectable } from '@nestjs/common';
import { Transcoder } from './trancoder';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

export type ProcessProps = {
  inputPath: string;
  fileName: string;
};

@Injectable()
export class HlsService {
  async process({ inputPath, fileName }: ProcessProps) {
    const outputPath = resolve(
      process.cwd(),
      'static',
      'stream',
      fileName.split('.')[0],
    );
    await mkdir(outputPath);
    const transcoder = new Transcoder(inputPath, outputPath, {});
    await transcoder.transcode();

    const outputLocation = `/stream/${fileName.split('.')[0]}/index.m3u8`;

    return {
      outputLocation,
    };
  }
}
