import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_WATCHES, BATCH_TOP_MEMBERS } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Timeout(3000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	/**
	 * 1) Har kuni soat 01:00:00 da WatchRank va MemberRank = 0 qilib reset qiladi
	 */
	@Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECUTED');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 00 01 * * *', { name: BATCH_TOP_WATCHES })
	public async batchTopWatches() {
		try {
			this.logger['context'] = BATCH_TOP_WATCHES;
			this.logger.debug('EXECUTED');
			await this.batchService.batchTopWatches();
		} catch (err) {
			this.logger.error(err);
		}
	}

	/**
	 * 3) Har kuni soat 01:00:40 da TOP MEMBERS ni qayta hisoblaydi
	 * DEALER lar uchun
	 */
	@Cron('40 00 01 * * *', { name: BATCH_TOP_MEMBERS })
	public async batchTopMembers() {
		try {
			this.logger['context'] = BATCH_TOP_MEMBERS;
			this.logger.debug('EXECUTED');
			await this.batchService.batchTopMembers();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
