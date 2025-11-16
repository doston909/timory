import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationSchema from '../../schemas/Notification.model';
import { SocketModule } from '../../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema }
    ]),
    SocketModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService], 
})
export class NotificationModule {}
