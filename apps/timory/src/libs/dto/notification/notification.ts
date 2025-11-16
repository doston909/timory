export interface Notification {
	_id?: string;
	notificationType: string;
	notificationGroup: string;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	watchId?: string;
	articleId?: string;
	createdAt?: Date;
}
