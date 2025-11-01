import { NestFactory } from '@nestjs/core';
import { TimoryBatchModule } from './timory-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(TimoryBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
