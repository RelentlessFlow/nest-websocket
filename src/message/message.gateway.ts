import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';

@WebSocketGateway(4000, { cors: true, transports: ['websocket'] })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(@ConnectedSocket() client: any) {
    this.logger.log(`Client Connected: ${client}`);
  }

  afterInit(server: any) {
    this.logger.log(`After Server Init: ${server}`);
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    this.logger.log(`Client Disconnect: ${client}`);
  }

  private logger: Logger = new Logger('MessageGateway');

  @SubscribeMessage('test')
  hello(@MessageBody() payload: Record<string, any>): any {
    return {
      event: 'test',
      origin: payload,
      msg: 'test msg',
    };
  }

  @SubscribeMessage('subscribeMessage')
  async hello2(@MessageBody() payload: Record<string, any>, @ConnectedSocket() client: any) {
    const newMessage = await this.messagesService.createMessage(JSON.stringify(payload));
    client.send(JSON.stringify({ event: 'tmp', data: '数据库存储完成.' }));
    return { event: 'subscribeMessage', origin: payload };
  }
}
