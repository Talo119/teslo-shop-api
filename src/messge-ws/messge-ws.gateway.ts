import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessgeWsService } from './messge-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessgeWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messgeWsService: MessgeWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messgeWsService.registerClient(client, payload.id);
    } catch (error) {
      console.error(error);
      client.disconnect();
      return;
    }
    // console.log({ payload });

    this.wss.emit(
      'clients-updated',
      this.messgeWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messgeWsService.removeClient(client.id);
  }
  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload);

    // Emite mensaje al cliente
    /* client.emit('message-from-server', {
      fullName: 'Server',
      message: payload.message ?? 'No message',
    }); */

    // Emite mensaje a todos los clientes menos al que envio el mensaje
    /* client.broadcast.emit('message-from-server', {
      fullName: 'Server',
      message: payload.message ?? 'No message',
    }); */

    // Emite mensaje a todos los clientes
    this.wss.emit('message-from-server', {
      fullName: this.messgeWsService.getUserFullName(client.id),
      message: payload.message ?? 'No message',
    });
  }
}
