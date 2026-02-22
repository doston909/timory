import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway, ChatGateway],
  exports: [SocketGateway, ChatGateway],
})
export class SocketModule {}