import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Watch } from '../../libs/dto/watch/watch';
import { MemberService } from '../member/member.service';
import { WatchInput } from '../../libs/dto/watch/watch.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class WatchService {
	constructor(
		@InjectModel('Watch') private readonly watchModel: Model<Watch>,
		private memberService: MemberService,
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
}