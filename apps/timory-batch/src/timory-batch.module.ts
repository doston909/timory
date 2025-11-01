import { Module } from '@nestjs/common';
import { TimoryBatchController } from './timory-batch.controller';
import { TimoryBatchService } from './timory-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()], // we can use .env file
  controllers: [TimoryBatchController],
  providers: [TimoryBatchService],
})
export class TimoryBatchModule {}
