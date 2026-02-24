import { Schema } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../libs/enums/member.enum';

const MemberSchema = new Schema(
	{
		memberType: {
			type: String,
			enum: MemberType,
			default: MemberType.USER,
		},

		memberStatus: {
			type: String,
			enum: MemberStatus,
			default: MemberStatus.ACTIVE,
		},

		memberAuthType: {
			type: String,
			enum: MemberAuthType,
			default: MemberAuthType.PHONE,
		},

		memberName: {
			type: String,
			default: null,
		},

		memberEmail: {
			type: String,
			index: { unique: true, sparse: true },
			default: null,
		},

		memberPhone: {
			type: String,
			index: { unique: true, sparse: true },
			// default yo'q — signupda yozilmasa maydon hujjatda bo'lmaydi, sparse index duplicate qilmaydi
		},

		googleId: {
			type: String,
			index: { unique: true, sparse: true },
			default: null,
		},

		memberPassword: {
			type: String,
			select: false,
			required: false,
		},

		memberPhoto: {
			type: String,
			default: null,
		},

		memberAddress: {
			type: String,
		},

		memberDesc: {
			type: String,
		},

		memberWatches: {
			type: Number,
			default: 0,
		},

		memberArticles: {
			type: Number,
			default: 0,
		},

		memberFollowers: {
			type: Number,
			default: 0,
		},

		memberFollowings: {
			type: Number,
			default: 0,
		},

		memberPoints: {
			type: Number,
			default: 0,
		},
		memberLikes: {
			type: Number,
			default: 0,
		},

		memberViews: {
			type: Number,
			default: 0,
		},

		memberComments: {
			type: Number,
			default: 0,
		},

		memberRank: {
			type: Number,
			default: 0,
		},

		memberBlocks: {
			type: Number,
			default: 0,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'members' },
);

export default MemberSchema;
