import { Module } from '@nestjs/common';
import { MessgeWsService } from './messge-ws.service';
import { MessgeWsGateway } from './messge-ws.gateway';

@Module({
  providers: [MessgeWsGateway, MessgeWsService],
})
export class MessgeWsModule {}
