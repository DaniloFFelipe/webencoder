import { z } from 'zod';

export const CreateAssetDtoSchema = z.object({
  storageLocation: z.string(),
  fileName: z.string(),
  callback: z.string().url().optional(),
});

export type CreateAssetDto = z.infer<typeof CreateAssetDtoSchema>;
