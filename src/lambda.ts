import { NestFactory } from '@nestjs/core';
import serverless from 'serverless-http';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

let cachedHandler: ReturnType<typeof serverless>;

async function bootstrap() {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule, { bodyParser: false });
    configureApp(app);
    await app.init();
    cachedHandler = serverless(app.getHttpAdapter().getInstance());
  }

  return cachedHandler;
}

export const handler = async (event: object, context: object) => {
  const server = await bootstrap();
  return server(event, context);
};
