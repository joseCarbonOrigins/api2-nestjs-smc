import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Context, Handler, Callback } from 'aws-lambda';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let server: Handler;

function setUpSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SMC API')
    .setDescription(
      'The main APIGateway endpoint is: https://2d5yxyfnc5.execute-api.us-east-1.amazonaws.com/prod',
    )
    .setVersion('1.0')
    .addTag('SMC')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();
  setUpSwagger(app);
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
