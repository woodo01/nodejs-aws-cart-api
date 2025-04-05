import { NestFactory } from '@nestjs/core';
import { configure } from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import helmet from 'helmet';
import 'dotenv/config';

import { AppModule } from './app.module';

let server: Handler;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return configure({ app: expressApp });
}

export const handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  try {
    if (!server) {
      console.log('Bootstrapping application...');
      server = await bootstrap();
    }

    return await server(event, context, callback);
  } catch (error) {
    console.error('Error handling request:', error);
    throw error;
  }
};
