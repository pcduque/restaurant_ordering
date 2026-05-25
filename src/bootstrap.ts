import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { MaskedLoggingInterceptor } from './common/interceptors/masked-logging.interceptor';

export function configureApp(app: INestApplication): void {
  app.use((request: Request, _response: Response, next: NextFunction) => {
    const body =
      Buffer.isBuffer(request.body) || ArrayBuffer.isView(request.body)
        ? Buffer.from(request.body as Uint8Array).toString('utf8')
        : request.body;

    if (typeof body === 'string' && body.length > 0) {
      try {
        request.body = JSON.parse(body);
      } catch {
        // Let validation report the malformed body.
      }
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new MaskedLoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Restaurant Ordering API')
    .setDescription('Restaurant ordering backend with cart pricing and order timeline audit trail.')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'Idempotency-Key', in: 'header' }, 'Idempotency-Key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
