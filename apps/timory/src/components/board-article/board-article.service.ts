import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BoardArticleCategory, BoardArticleStatus, CREATE_ARTICLE_CATEGORIES } from '../../libs/enums/board-article.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class BoardArticleService {
	private readonly logger = new Logger(BoardArticleService.name);

	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}

	public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
		this.logger.log(`createBoardArticle service: title="${input.articleTitle?.slice(0, 30)}..."`);
		if (!CREATE_ARTICLE_CATEGORIES.includes(input.articleCategory)) {
			throw new BadRequestException(
				'articleCategory must be one of: Free board (FREE), Recommendation (RECOMMEND), News (NEWS)',
			);
		}
		input.memberId = memberId;
		try {
			const payload: T = {
				articleCategory: input.articleCategory,
				articleTitle: input.articleTitle,
				articleContent: input.articleContent,
				articleStatus: BoardArticleStatus.PUBLISHING,
				memberId,
			};
			if (input.articleImage != null && input.articleImage !== '') {
				payload.articleImage = input.articleImage;
			}
			const result = await this.boardArticleModel.create(payload);
			await this.memberService.memberStatusEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: 1,
			});

			return result;
		} catch (err) {
			this.logger.warn(`createBoardArticle failed: ${err?.message}`);
			const message = err?.message ?? Message.CREATE_FAILED;
			throw new BadRequestException(message);
		}
	}

	public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: BoardArticleStatus.PUBLISHING,
		};

		const targetBoardArticle: BoardArticle = await this.boardArticleModel.findOne(search).lean().exec();
		if (!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.boardArticleStatusEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
				targetBoardArticle.articleViews++;
			}

			// meLiked
			const likeInput = {memberId: memberId, likeRefId: articleId, likeGroup: LikeGroup.ARTICLE};
			targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		

		targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
		return targetBoardArticle;
	}

	public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;
		const id = shapeIntoMongoObjectId(_id);

		if (articleStatus === BoardArticleStatus.REMOVE) {
			const doc = await this.boardArticleModel.findOneAndDelete({
				_id: id,
				memberId: memberId,
				articleStatus: { $in: [BoardArticleStatus.PUBLISHING, BoardArticleStatus.DELETE] },
			}).exec();
			if (!doc) throw new InternalServerErrorException(Message.UPDATE_FAILED);
			await this.memberService.memberStatusEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
			return doc as BoardArticle;
		}

		const updatePayload = { ...input };
		delete updatePayload._id;
		const result = await this.boardArticleModel
			.findOneAndUpdate(
				{ _id: id, memberId: memberId, articleStatus: { $in: [BoardArticleStatus.PUBLISHING, BoardArticleStatus.DELETE] } },
				{ $set: updatePayload },
				{ new: true },
			)
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;
		const match: T = { articleStatus: BoardArticleStatus.PUBLISHING };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input.search?.memberId) {
			match.memberId = shapeIntoMongoObjectId(input.search.memberId);
		}
		console.log('match:', match);

		const result = await this.boardArticleModel
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

	public async getMyBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;
		const match: T = {
			memberId: memberId,
			articleStatus: { $in: [BoardArticleStatus.PUBLISHING, BoardArticleStatus.DELETE] },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
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

	public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle> {
		const target: BoardArticle = await this.boardArticleModel
			.findOne({ _id: likeRefId, articleStatus: BoardArticleStatus.PUBLISHING })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.boardArticleStatusEditor({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return await this.getBoardArticle(memberId, likeRefId);
	}

    /** ADMIN **/

	public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
		const { articleStatus, articleCategory } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleStatus) match.articleStatus = articleStatus;
		if (articleCategory) match.articleCategory = articleCategory;

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
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

	public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;
		const id = shapeIntoMongoObjectId(_id);

		if (articleStatus === BoardArticleStatus.REMOVE) {
			const doc = await this.boardArticleModel.findOneAndDelete({
				_id: id,
				articleStatus: { $in: [BoardArticleStatus.PUBLISHING, BoardArticleStatus.DELETE] },
			}).exec();
			if (!doc) throw new InternalServerErrorException(Message.REMOVE_FAILED);
			await this.memberService.memberStatusEditor({
				_id: doc.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
			return doc as BoardArticle;
		}

		const updatePayload = { ...input };
		delete updatePayload._id;
		const result = await this.boardArticleModel
			.findOneAndUpdate(
				{ _id: id, articleStatus: { $in: [BoardArticleStatus.PUBLISHING, BoardArticleStatus.DELETE] } },
				{ $set: updatePayload },
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
		const doc = await this.boardArticleModel.findByIdAndDelete(articleId).exec();
		if (!doc) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		await this.memberService.memberStatusEditor({
			_id: doc.memberId,
			targetKey: 'memberArticles',
			modifier: -1,
		});
		return doc as BoardArticle;
	}

	public async boardArticleStatusEditor(input: StatisticModifier): Promise<BoardArticle> {
		const { _id, targetKey, modifier } = input;
		return await this.boardArticleModel
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
