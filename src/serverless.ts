import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// serverless dependencies
import serverlessExpress from '@vendia/serverless-express';
import { Context, Handler, Callback } from 'aws-lambda';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  app.enableCors();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
