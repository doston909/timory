import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsgateway');
	private dealerClients: Map<string, WebSocket> = new Map();
	private summaryClient: number = 0;

	public afterInit(server: Server) {
		this.logger.log(`WebSocket Server Initializsd total: ${this.summaryClient}`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}

	@SubscribeMessage('connectDealer')
	handleDealerConnect(client: WebSocket, payload: any) {
		const dealerId = payload.dealerId;
		this.dealerClients.set(dealerId, client);
		console.log(`Dealer Connected: ${dealerId}`);
	}

	handleDealerDisconnect(client: WebSocket) {
		for (const [dealerId, ws] of this.dealerClients.entries()) {
			if (ws === client) {
				this.dealerClients.delete(dealerId);
				console.log(`Dealer Disconnected: ${dealerId}`);
				break;
			}
		}
	}

	sendDealerNotification(dealerId: string, payload: any) {
		const socket = this.dealerClients.get(dealerId);
		if (socket) {
			socket.send(
				JSON.stringify({
					event: 'dealerNotification',
					data: payload,
				}),
			);
		}
	}
}
