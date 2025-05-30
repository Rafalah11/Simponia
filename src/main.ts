import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001', // Sesuaikan dengan port frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Tambahkan OPTIONS
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization', // Tambahkan headers yang diperlukan
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
