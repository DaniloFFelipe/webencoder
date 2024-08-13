import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Paramtype,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private type: Paramtype = 'body',
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (this.type === metadata.type) {
        const parsedValue = this.schema.parse(value);
        return parsedValue;
      }

      return value;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
