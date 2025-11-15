import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Watch, Watches } from '../../libs/dto/watch/watch';
import { MemberService } from '../member/member.service';
import {
	AllWatchesInquiry,
	BrandWatchesInquiry,
	DealerWatchesInquiry,
	OrdinaryInquiry,
	WatchesInquiry,
	WatchInput,
} from '../../libs/dto/watch/watch.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { ViewService } from '../view/view.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { WatchStatus } from '../../libs/enums/watch.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import moment from 'moment';
import { WatchUpdate } from '../../libs/dto/watch/watch.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class WatchService {
	constructor(
		@InjectModel('Watch') private readonly watchModel: Model<Watch>,
		private memberService: MemberService,
		private viewService: ViewService,
			private likeService: LikeService,
	) {}

	public async createBrandWatch(input: WatchInput): Promise<Watch> {
		try {
			const brand = await this.memberService.getMemberById(input.memberId);
			if (!brand || brand.memberType !== MemberType.BRAND) throw new BadRequestException(Message.ONLY_BRAND);

			let dealerIds: string[] = [];

			if (input.dealerId?.length) {
				const dealers = await this.memberService.findDealersByIds(input.dealerId);
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
			throw new BadRequestException(Message.ALREADY_CREATED);
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
			const likeInput = {memberId: memberId, likeRefId: watchId, likeGroup: LikeGroup.WATCH};
			targetWatch.meLiked = await this.likeService.checkLikeExistence(likeInput);
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

	public async updateWatch(memberId: ObjectId, input: WatchUpdate): Promise<Watch> {
		let { watchStatus } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			watchStatus: WatchStatus.ACTIVE,
		};

		if (watchStatus === WatchStatus.SOLD) input.soldAt = moment().toDate();
		else if (watchStatus === WatchStatus.DELETE) input.deletedAt = moment().toDate();

		const result = await this.watchModel
			.findByIdAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.soldAt || input.deletedAt) {
			await this.memberService.memberStatusEditor({
				_id: memberId,
				targetKey: 'memberWatches',
				modifier: -1,
			});
		}

		return result;
	}

	public async getWatches(memberId: ObjectId, input: WatchesInquiry): Promise<Watches> {
		const match: T = { watchStatus: WatchStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.watchModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: WatchesInquiry): void {
		const {
			brandId,
			dealerId,
			locationList,
			typeList,
			statusList,
			pricesRange,
			sizesRange,
			periodsRange,
			options,
			text,
		} = input.search;

		if (brandId) match.brandId = shapeIntoMongoObjectId(brandId);
		if (dealerId) match.dealerId = shapeIntoMongoObjectId(dealerId);

		if (locationList && locationList.length > 0) match.watchLocation = { $in: locationList };

		if (typeList && typeList.length > 0) match.watchType = { $in: typeList };

		if (statusList && statusList.length > 0) match.watchStatus = { $in: statusList };

		if (pricesRange)
			match.watchPrice = {
				$gte: pricesRange.start,
				$lte: pricesRange.end,
			};

		if (sizesRange)
			match.watchSize = {
				$gte: sizesRange.start,
				$lte: sizesRange.end,
			};

		if (periodsRange)
			match.createdAt = {
				$gte: periodsRange.start,
				$lte: periodsRange.end,
			};

		if (text && text.trim().length > 0)
			match.$or = [
				{ watchTitle: { $regex: new RegExp(text, 'i') } },
				{ watchModel: { $regex: new RegExp(text, 'i') } },
				{ brandName: { $regex: new RegExp(text, 'i') } },
				{ description: { $regex: new RegExp(text, 'i') } },
			];

		if (options && options.length > 0) {
			match.$and = options.map((opt) => ({
				[`options.${opt}`]: true,
			}));
		}
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
		return await this.likeService.getFavoriteWatches(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
		return await this.viewService.getVisitedWatches(memberId, input);
	}

	public async getBrandWatches(memberId: ObjectId, input: BrandWatchesInquiry): Promise<Watches> {
		const { watchStatus, text } = input.search;

		if (watchStatus === WatchStatus.DELETE) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}

		const match: T = {
			memberId: memberId,
			watchStatus: watchStatus ?? { $ne: WatchStatus.DELETE },
		};

		if (text) {
			match.$or = [
				{ watchTitle: { $regex: new RegExp(text, 'i') } },
				{ description: { $regex: new RegExp(text, 'i') } },
			];
		}
		console.log('match:', match);

		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		const result = await this.watchModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'members',
									localField: 'memberId',
									foreignField: '_id',
									as: 'memberData',
								},
							},
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async getDealerWatches(memberId: ObjectId, input: DealerWatchesInquiry): Promise<Watches> {
		const { watchStatus, brandId, text } = input.search;

		if (watchStatus === WatchStatus.DELETE) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}

		const match: T = {
			memberId: memberId,
			watchStatus: watchStatus ?? { $ne: WatchStatus.DELETE },
		};

		if (brandId) match.brandId = shapeIntoMongoObjectId(brandId);

		if (text) {
			match.$or = [
				{ watchTitle: { $regex: new RegExp(text, 'i') } },
				{ description: { $regex: new RegExp(text, 'i') } },
			];
		}

		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		const result = await this.watchModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'members',
									localField: 'memberId',
									foreignField: '_id',
									as: 'memberData',
								},
							},
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async likeTargetWatch(memberId: ObjectId, likeRefId: ObjectId): Promise<Watch> {
			const target: Watch = await this.watchModel
			.findOne({ _id: likeRefId, watchStatus: WatchStatus.ACTIVE })
			.exec();
			if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	
			const input: LikeInput = {
				memberId: memberId,
				likeRefId: likeRefId,
				likeGroup: LikeGroup.WATCH,
			};
	
			const modifier: number = await this.likeService.toggleLike(input);
			const result = await this.watchStatusEditor({ _id: likeRefId, targetKey: 'watchLikes', modifier: modifier });
	
			if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
			return result;
		}

	public async getAllWatchesByAdmin(input: AllWatchesInquiry): Promise<Watches> {
		const { watchStatus, watchLocationList, watchTypeList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (watchStatus) match.watchStatus = watchStatus;
		if (watchLocationList) match.watchLocation = { $in: watchLocationList };
		if (watchTypeList?.length) match.watchType = { $in: watchTypeList };

		const result = await this.watchModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember, //  memberData: [memberDataValue]
							{ $unwind: '$memberData' }, //  memberData: memberDataValue
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateWatchByAdmin(input: WatchUpdate): Promise<Watch> {
		let { watchStatus, soldAt, deletedAt } = input;

		const search: T = {
			_id: input._id,
			watchStatus: WatchStatus.ACTIVE,
		};

		if (watchStatus === WatchStatus.SOLD) soldAt = moment().toDate();
		else if (watchStatus === WatchStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.watchModel.findByIdAndUpdate(search, input, { new: true }).exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatusEditor({
				_id: result.memberId,
				targetKey: 'memberWatches',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeWatchByAdmin(watchId: ObjectId): Promise<Watch> {
		const search: T = { _id: watchId, watchStatus: WatchStatus.DELETE };
		const result = await this.watchModel.findByIdAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}
}
