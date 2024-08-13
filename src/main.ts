import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'static'),
    prefix: '/content',
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 30720 * 1024 * 1024, // 30gb limit
    },
  });

  await app.listen(4020);
}

bootstrap();
