// main.ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('api') // Optional: group endpoints by tag
    .build();
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup the Swagger UI endpoint (e.g., http://localhost:3000/api)
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
