import { Module } from '@nestjs/common';
import { MessgeWsService } from './messge-ws.service';
import { MessgeWsGateway } from './messge-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessgeWsGateway, MessgeWsService],
  imports: [AuthModule],
})
export class MessgeWsModule {}
