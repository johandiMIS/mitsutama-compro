import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind a reverse proxy / load balancer, `request.ip` is the proxy's address unless
  // Express is told to trust X-Forwarded-For. The login rate limit keys on that IP, so
  // set TRUST_PROXY to the number of proxy hops (usually 1) when deployed behind one.
  // Leave it unset when exposed directly, or clients could spoof their IP via the header.
  const trustProxy = process.env.TRUST_PROXY?.trim();
  if (trustProxy) {
    app.set(
      'trust proxy',
      /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy,
    );
  }

  // The admin session is a cookie, so the guard needs it parsed off the request.
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3006',
    // Required for the admin panel: without it the browser drops the session cookie
    // on cross-origin requests from the web app to this API.
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3007);
}
void bootstrap();
