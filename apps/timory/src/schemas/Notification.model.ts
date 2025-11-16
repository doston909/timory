import { Schema } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.WAIT,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationDesc: {
			type: String,
		},

		authorId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},

		receiverId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},

		// Watch App uchun to‘g‘rilangan
		watchId: {
			type: Schema.Types.ObjectId,
			ref: 'Watch',
		},

		watchData: {
			type: Object,
			default: null,
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
