import 'reflect-metadata';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

config({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use(
    (
      req: { headers: Record<string, string | undefined> },
      res: { setHeader: (k: string, v: string) => void },
      next: () => void,
    ) => {
      const id = req.headers['x-request-id'] ?? randomUUID();
      req.headers['x-request-id'] = id;
      res.setHeader('x-request-id', id);
      next();
    },
  );

  app.setGlobalPrefix('api/v1');

  if (process.env.NODE_ENV !== 'production') {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('PulseWatch')
        .setDescription('PulseWatch API documentation')
        .setVersion('0.1')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc, { useGlobalPrefix: false });
  }

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
