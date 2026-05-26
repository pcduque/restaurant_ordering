import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, NextFunction, Request, Response, urlencoded } from 'express';
import { MaskedLoggingInterceptor } from './common/interceptors/masked-logging.interceptor';
import { MAX_TIMELINE_PAYLOAD_BYTES } from './common/utils/payload-size.util';

type BodyParserError = Error & {
  status?: number;
  type?: string;
};

export function configureApp(app: INestApplication): void {
  app.use(json({ limit: MAX_TIMELINE_PAYLOAD_BYTES }));
  app.use(urlencoded({ extended: true, limit: MAX_TIMELINE_PAYLOAD_BYTES }));
  app.use(
    (
      error: BodyParserError,
      _request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (error.type === 'entity.too.large') {
        response.status(400).json({
          statusCode: 400,
          message: `Request payload must be <= ${MAX_TIMELINE_PAYLOAD_BYTES} bytes`,
          error: 'Bad Request',
        });
        return;
      }

      next(error);
    },
  );

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
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('Restaurant Ordering API')
    .setDescription(
      'Restaurant ordering backend with cart pricing and order timeline audit trail.',
    )
    .setVersion('1.0.0')
    .addApiKey(
      { type: 'apiKey', name: 'Idempotency-Key', in: 'header' },
      'Idempotency-Key',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
