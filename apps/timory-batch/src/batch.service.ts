import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/timory-api/src/libs/dto/member/member';

import { Watch } from 'apps/timory-api/src/libs/dto/watch/watch';
import { MemberStatus, MemberType } from 'apps/timory-api/src/libs/enums/member.enum';
import { WatchStatus } from 'apps/timory-api/src/libs/enums/watch.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Watch') private readonly watchModel: Model<Watch>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.watchModel
			.updateMany(
				{
					watchStatus: WatchStatus.ACTIVE,
				},
				{ watchRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.DEALER,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopWatches(): Promise<void> {
		const watches: Watch[] = await this.watchModel
			.find({
				watchStatus: WatchStatus.ACTIVE,
				watchRank: 0,
			})
			.exec();

		const promisedList = watches.map(async (ele: Watch) => {
			const { _id, watchLikes, watchViews } = ele;
			const rank = watchLikes * 2 + watchViews * 1;
			return await this.watchModel.findByIdAndUpdate(_id, { watchRank: rank }, { new: true });
		});
		await Promise.all(promisedList);
	}

	public async batchTopMembers(): Promise<void> {
		const members: Member[] = await this.memberModel
			.find({
				memberStatus: MemberStatus.ACTIVE,
				memberType: MemberType.DEALER,
				memberRank: 0,
			})
			.exec();

		const promisedList = members.map(async (ele: Member) => {
			const { _id, memberWatches, memberLikes, memberArticles, memberViews } = ele;
			const rank =
				(memberWatches ?? 0) * 5 + 
				(memberArticles ?? 0) * 3 + 
				(memberLikes ?? 0) * 2 + 
				(memberViews ?? 0) * 1;

			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}

	public getHello(): string {
		return 'Welcome to NESTAR BATCH SERVER!';
	}
}
