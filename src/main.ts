import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';

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
  const app = await NestFactory.create(AppModule);
  setUpSwagger(app);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
