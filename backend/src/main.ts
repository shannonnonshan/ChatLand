import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Serve static files từ folder "uploads"
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

    const allowedOrigins = [
      'http://localhost:3000', // local dev
      'https://chat-land-git-master-minh-khanhs-projects-11c697e8.vercel.app' // production
    ];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          // origin hợp lệ hoặc request từ Postman / curl (no origin)
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    });


  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
