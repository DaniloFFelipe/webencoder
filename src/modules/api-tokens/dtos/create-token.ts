import { z } from 'zod';

export const CreateTokenDtoSchema = z.object({
  name: z.string().min(3),
});

export type CreateTokenDto = z.infer<typeof CreateTokenDtoSchema>;
