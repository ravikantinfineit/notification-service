import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and start the NestJS application
 * Configures Swagger documentation, validation pipes, and CORS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger API Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('Enterprise Notification Service API')
    .setDescription(
      'A comprehensive notification service API supporting multiple channels (Email, SMS, WhatsApp, Push) ' +
        'with queue management, user preferences, transaction tracking, and admin monitoring capabilities.',
    )
    .setVersion('1.0.0')
    .addTag('notifications', 'Notification sending and management endpoints')
    .addTag('user-preferences', 'User notification preferences management')
    .addTag('admin', 'Admin dashboard and monitoring endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for admin endpoints',
      },
      'api-key',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.example.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Notification Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api`);
}

bootstrap();
