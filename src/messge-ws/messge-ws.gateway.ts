import { WebSocketGateway } from '@nestjs/websockets';
import { MessgeWsService } from './messge-ws.service';

@WebSocketGateway()
export class MessgeWsGateway {
  constructor(private readonly messgeWsService: MessgeWsService) {}
}
