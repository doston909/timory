import { Schema } from 'mongoose';
import { WatchLocation, WatchStatus, WatchType } from '../libs/enums/watch.enum';

const WatchSchema = new Schema(
	{
		watchType: {
			type: String,
			enum: WatchType,
			required: true,
		},

		watchStatus: {
			type: String,
			enum: WatchStatus,
			default: WatchStatus.ACTIVE,
		},

		watchLocation: {
			type: String,
			enum: WatchLocation,
			required: true,
		},

		watchAddress: {
			type: String,
			required: true,
		},

		watchTitle: {
			type: String,
			required: true,
		},

		watchPrice: {
			type: Number,
			required: true,
		},

		watchViews: {
			type: Number,
			default: 0,
		},

		watchLikes: {
			type: Number,
			default: 0,
		},

		watchComments: {
			type: Number,
			default: 0,
		},

		watchRank: {
			type: Number,
			default: 0,
		},

		watchImages: {
			type: [String],
			required: true,
		},

		watchDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		dealerIds: {
			type: [Schema.Types.ObjectId],
			ref: 'Member',
			default: [],
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'watches' },
);

WatchSchema.index({ watchType: 1, watchLocation: 1, watchTitle: 1, watchPrice: 1 }, { unique: true });

export default WatchSchema;
