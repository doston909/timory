import { Controller, Get } from '@nestjs/common';
import { TimoryBatchService } from './timory-batch.service';

@Controller()
export class TimoryBatchController {
  constructor(private readonly timoryBatchService: TimoryBatchService) {}

  @Get()
  getHello(): string {
    return this.timoryBatchService.getHello();
  }
}
