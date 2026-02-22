import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { SocketGateway } from '../../socket/socket.gateway';
import { Notification } from '../../libs/dto/notification/notification';
import { Watch } from '../../libs/dto/watch/watch';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		private socketGateway: SocketGateway,
	) {}

	public async notifyDealers(dealerIds: string[], watch: Watch, brand: Member): Promise<void> {
		try {
			// 1) Create notification records for all dealers
			const notifications = dealerIds.map((dealerId) => ({
				notificationType: NotificationType.NEW_WATCH,
				notificationGroup: NotificationGroup.WATCH,
				notificationTitle: 'New Watch Uploaded',
				notificationDesc: `${brand.memberName} has uploaded a new watch.`,
				authorId: brand._id,
				receiverId: dealerId,
				watchId: watch._id,
				watchData: {
					watchType: watch.watchType,
					watchLocation: watch.watchLocation,
					watchModelName: watch.watchModelName,
					watchPrice: watch.watchPrice,
					watchImages: watch.watchImages,
					watchDescription: watch.watchDescription,
				},
			}));

			await this.notificationModel.insertMany(notifications);

			// 2) Send real-time notifications via WebSocket
			dealerIds.forEach((dealerId) => {
				this.socketGateway.sendDealerNotification(dealerId, {
					title: 'New Watch Assigned',
					message: `${brand.memberName} has uploaded a new watch for you.`,
					watchData: notifications[0].watchData,
					watchId: watch._id,
				});
			});
		} catch (err) {
			console.log('Error notifyDealers:', err.message);
		}
	}
}
