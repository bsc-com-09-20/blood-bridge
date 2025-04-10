import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: false, // <-- allow extra props like 'role'
      transform: true,
    }),
  );
  
  //app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('Blood-bridge')
    .setDescription('This is blood bridge api')
    .setVersion('1.0')
    .addTag('api') // Optional: group endpoints by tag
    .build();
  app.enableCors(
    {
      origin: '*',
    }
  );
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

  

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3004, '0.0.0.0');
  
}
bootstrap();