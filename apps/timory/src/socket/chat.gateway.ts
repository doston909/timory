import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';

const MAX_CHAT_MESSAGES = 100;

interface ChatMessagePayload {
  text: string;
  memberData: { _id: string; memberName?: string; memberImage?: string } | null;
}

interface StoredMessage {
  event: string;
  text: string;
  memberData: { _id: string; memberName?: string; memberImage?: string } | null;
}

@WebSocketGateway({ path: '/chat', transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private clients: Set<WebSocket> = new Set();
  private messages: StoredMessage[] = [];

  @WebSocketServer()
  server: Server;

  private broadcast(obj: object) {
    const payload = JSON.stringify(obj);
    this.clients.forEach((client) => {
      if (client.readyState === (client as any).OPEN) {
        client.send(payload);
      }
    });
  }

  private sendTo(client: WebSocket, obj: object) {
    if (client.readyState === (client as any).OPEN) {
      client.send(JSON.stringify(obj));
    }
  }

  handleConnection(client: WebSocket) {
    this.clients.add(client);
    this.logger.log(`Chat client connected. Total: ${this.clients.size}`);

    this.sendTo(client, { event: 'info', totalClients: this.clients.size, memberData: null });
    this.sendTo(client, { event: 'getMessages', list: this.messages });
    this.broadcast({ event: 'info', totalClients: this.clients.size, memberData: null });
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
    this.logger.log(`Chat client disconnected. Total: ${this.clients.size}`);
    this.broadcast({ event: 'info', totalClients: this.clients.size, memberData: null });
  }

  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: ChatMessagePayload | string): void {
    const text =
      typeof payload === 'string' ? payload.trim() : payload?.text?.trim();
    if (!text) return;

    const memberData =
      typeof payload === 'object' && payload?.memberData
        ? payload.memberData
        : null;
    const msg: StoredMessage = { event: 'message', text, memberData };
    this.messages.push(msg);
    if (this.messages.length > MAX_CHAT_MESSAGES) {
      this.messages = this.messages.slice(-MAX_CHAT_MESSAGES);
    }
    this.broadcast(msg);
  }
}
