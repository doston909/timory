import { Schema } from 'mongoose';
import { WatchLocation, WatchStatus, WatchType } from '../libs/enums/watch.enum';

const WatchSchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: WatchType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: WatchStatus,
			default: WatchStatus.ACTIVE,
		},

		propertyLocation: {
			type: String,
			enum: WatchLocation,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertySquare: {
			type: Number,
			required: true,
		},

		propertyBeds: {
			type: Number,
			required: true,
		},

		propertyRooms: {
			type: Number,
			required: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
		},

		propertyBarter: {
			type: Boolean,
			default: false,
		},

		propertyRent: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'watches' },
);

WatchSchema.index({ watchType: 1, watchLocation: 1, watchTitle: 1, watchPrice: 1 }, { unique: true });

export default WatchSchema;
