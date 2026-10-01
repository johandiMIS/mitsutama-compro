import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { HeroImagesModule } from './modules/hero-images/hero-images.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminAuthModule,
    HeroImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
