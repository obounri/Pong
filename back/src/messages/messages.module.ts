import { User } from 'src/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MessageController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, Message, GroupMembers, GroupMessage } from './entities/message.entity';
import { JwtAuthModule } from 'src/jwt/jwt-auth.module';

@Module({
  imports: [JwtAuthModule, TypeOrmModule.forFeature([User,Group, Message, GroupMembers, GroupMessage])],
  providers: [MessagesGateway, MessagesService],
  controllers: [MessageController],
})
export class MessagesModule {}
