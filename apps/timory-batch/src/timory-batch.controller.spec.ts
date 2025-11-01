import { Test, TestingModule } from '@nestjs/testing';
import { TimoryBatchController } from './timory-batch.controller';
import { TimoryBatchService } from './timory-batch.service';

describe('TimoryBatchController', () => {
  let timoryBatchController: TimoryBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TimoryBatchController],
      providers: [TimoryBatchService],
    }).compile();

    timoryBatchController = app.get<TimoryBatchController>(TimoryBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(timoryBatchController.getHello()).toBe('Hello World!');
    });
  });
});
