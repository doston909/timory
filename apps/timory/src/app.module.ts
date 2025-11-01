import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()], // we can use .env file
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
