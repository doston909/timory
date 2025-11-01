import { Injectable } from '@nestjs/common';

@Injectable()
export class TimoryBatchService {
  getHello(): string {
    return 'Hello Batch!';
  }
}
