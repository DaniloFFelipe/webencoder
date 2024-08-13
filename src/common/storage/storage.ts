import { MemoryStorageFile } from '@blazity/nest-file-fastify';

export interface FileLocation {
  location: string;
  fileName: string;
}

export abstract class Storage {
  abstract uploadFile(file: MemoryStorageFile): Promise<FileLocation>;
  abstract uploadFolder(s3Path: string, path: string): Promise<void>;
  abstract loadFile(
    location: string,
    fileName: string,
  ): Promise<{ tmpLocation: string; assetFileName: string }>;
}
