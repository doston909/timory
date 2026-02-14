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
			default: null,
		},

		watchAddress: {
			type: String,
			default: null,
		},

		watchModelName: {
			type: String,
			required: true,
		},

		watchLimitedEdition: {
			type: Boolean,
			default: false,
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

		watchBrand: {
			type: String,
			default: null,
		},

		watchColor: {
			type: String,
			default: null,
		},

		watchCaseShape: {
			type: String,
			default: null,
		},

		watchCaseSize: {
			type: String,
			default: null,
		},

		watchCountry: {
			type: String,
			default: null,
		},

		watchMakeData: {
			type: String,
			default: null,
		},

		watchWaterResistance: {
			type: Number,
			default: null,
		},

		watchAvailability: {
			type: Number,
			default: null,
		},

		watchMaterial: {
			type: String,
			default: null,
		},

		watchDescription: {
			type: String,
			default: null,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		dealerId: {
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

WatchSchema.index({ watchType: 1, watchModelName: 1, watchPrice: 1 }, { unique: false });

export default WatchSchema;
