import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  APPLICATION_ENDPOINT: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  API_ADMIN_TOKEN: z.string(),
  BUCKET_NAME: z.string(),
  BUCKET_REGION: z.string().default('us-west-1'),
  STORAGE_ENDPOINT: z.string(),
  STORAGE_SK: z.string(),
  STORAGE_AK: z.string(),
});

export const env = envSchema.parse(process.env);
