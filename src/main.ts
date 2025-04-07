import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Your NestJS server (for Swagger)
      'http://localhost', // Common Flutter web debugging
      'http://localhost:XXXX', // Replace XXXX with your Flutter web port
      'http://10.0.2.2:3000', // Android emulator access to localhost
      'http://<YOUR_LOCAL_IP>:3000', // For physical device testing
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  // Validation Pipe configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // Helps with query/param conversion
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth() // If you're using JWT authentication
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3007);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();