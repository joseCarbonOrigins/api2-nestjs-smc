import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';

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

async function bootstrap() {
  Sentry.init({
    dsn: 'https://aec92c65ed10431faf5a0f02ea14f174@o4503922291507200.ingest.sentry.io/4503923308822528',
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  const app = await NestFactory.create(AppModule);
  setUpSwagger(app);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
