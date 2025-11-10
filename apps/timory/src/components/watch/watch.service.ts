import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Watch } from '../../libs/dto/watch/watch';
import { MemberService } from '../member/member.service';
import { WatchInput } from '../../libs/dto/watch/watch.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { ViewService } from '../view/view.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { WatchStatus } from '../../libs/enums/watch.enum';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class WatchService {
	constructor(
		@InjectModel('Watch') private readonly watchModel: Model<Watch>,
		private memberService: MemberService,
		private viewService: ViewService,
	) {}

	public async createBrandWatch(input: WatchInput): Promise<Watch> {
		try {
			const brand = await this.memberService.getMemberById(input.memberId);
			if (!brand || brand.memberType !== MemberType.BRAND)
				throw new BadRequestException('Faqat BRAND watch yaratishi mumkin.');

			let dealerIds: string[] = [];

			if (input.dealerIds?.length) {
				const dealers = await this.memberService.findDealersByIds(input.dealerIds);
				dealerIds = dealers.map((d) => d._id.toString());
			}

			const result = await this.watchModel.create({
				...input,
				memberId: brand._id,
				dealerIds,
			});

			await this.memberService.memberStatusEditor({
				_id: brand._id,
				targetKey: 'memberWatches',
				modifier: 1,
			});

			return result;
		} catch (err) {
			console.log('Error, createBrandWatch:', err.message);
			throw new BadRequestException('Soat yaratishda xatolik yuz berdi.');
		}
	}

	public async createDealerWatch(input: WatchInput): Promise<Watch> {
		try {
			const dealer = await this.memberService.getMemberById(input.memberId);
			if (!dealer || dealer.memberType !== MemberType.DEALER)
				throw new BadRequestException('Faqat DEALER watch yaratishi mumkin.');

			const result = await this.watchModel.create({
				...input,
				memberId: dealer._id,
				dealerIds: [dealer._id], // faqat o‘zi sotishi mumkin
			});

			await this.memberService.memberStatusEditor({
				_id: dealer._id,
				targetKey: 'memberWatches',
				modifier: 1,
			});

			return result;
		} catch (err) {
			console.log('Error, createDealerWatch:', err.message);
			throw new BadRequestException('Soat yaratishda xatolik yuz berdi.');
		}
	}

	public async getWatch(memberId: ObjectId, watchId: ObjectId): Promise<Watch> {
		const search: T = {
			_id: watchId,
			watchStatus: WatchStatus.ACTIVE,
		};

		const targetWatch: Watch = await this.watchModel.findOne(search).lean().exec();
		if (!targetWatch) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: watchId, viewGroup: ViewGroup.WATCH };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.watchStatusEditor({ _id: watchId, targetKey: 'watchViews', modifier: 1 });
				targetWatch.watchViews++;
			}

			// meLiked
		}

		targetWatch.memberData = await this.memberService.getMember(null, targetWatch.memberId);
		return targetWatch;
	}

	public async watchStatusEditor(input: StatisticModifier): Promise<Watch> {
		const { _id, targetKey, modifier } = input;
		return await this.watchModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}
}