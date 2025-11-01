import { Module } from '@nestjs/common';
import { TimoryBatchController } from './timory-batch.controller';
import { TimoryBatchService } from './timory-batch.service';

@Module({
  imports: [],
  controllers: [TimoryBatchController],
  providers: [TimoryBatchService],
})
export class TimoryBatchModule {}
