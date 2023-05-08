import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsResponse
} from '@nestjs/websockets';
import {
  NotAcceptableException,
  UseFilters,
  UsePipes,
  ForbiddenException,
  NotFoundException,
  ValidationPipe
} from '@nestjs/common'
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import {
  PrivateMessageDto,
  GroupMessageDto,
  GroupJoinDto,
  GroupLeaveDto,
  KickMemberDto
} from './dto/message.dto';
import { UserDecorator } from 'src/user/user.decorater';
// import { User } from 'src/user/user.decorater';
import { WsJwtGuard } from 'src/jwt/jwt-ws.guard';
import { UseGuards } from '@nestjs/common';
import { UserDto } from 'src/user/entities/user.dto';
import { JwtAuthService } from 'src/jwt/jwt-auth.service';
import { WebsocketExceptionsFilter } from './websocketsExceptionFilter';
import { User } from 'src/user/entities/user.entity';

@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService, 
    private jwtService: JwtAuthService
    ) {}

  @WebSocketServer()
  server: Server;

  private async getUserIdFromSocket(socket: Socket): Promise<{ uuid : string } | undefined> {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      ?.find((cookie: string) => cookie.includes('jwt='))
      ?.split('=')[1];
    if (token) {
      const payload = this.jwtService.verify(token).user;
      if (payload) {
        return payload;
      }
    }
    return undefined;
  }

  //#PRIVATE MESSAGES
  @UseGuards(WsJwtGuard)
  async handleConnection(socket: Socket) {
    let user = await this.getUserIdFromSocket(socket)
    if (user) {
      socket.join(`user-${user.uuid}`)
      // join rooms
      let userRooms = await this.messagesService.getUserGroups(user.uuid)
      userRooms.forEach(element => {
        socket.join(`group-${element.id}`)
      });
      socket.join('connected');
    }
  }

  @UseGuards(WsJwtGuard)
  async handleDisconnect(socket: Socket) {
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(socket: Socket,@MessageBody() data : PrivateMessageDto, @UserDecorator() user : { user : UserDto} ) {
    // Handle private messages between two users
    if (!user || data.receiverId === user.user.uuid) throw new NotAcceptableException('cannot send message to yourself');
    if (!data.message || data.message.trim() === '' || data.message.length > 250 ) throw new NotAcceptableException('message is empty or too long maximum is 255 characters')
    const result = await this.messagesService.createPrivateMessage(
      user.user.uuid,
      data.receiverId,
      data.message,
    );
    this.server.to(`user-${data.receiverId}`).to(`user-${user.user.uuid}`).emit('privateMessage', result);
    
    const privateUser = 
    this.server.to(`user-${data.receiverId}`).emit('privateUser', await this.messagesService.getPrivateUsersByid(data.receiverId, user.user.uuid));
    this.server.to(`user-${user.user.uuid}`).emit('privateUser', await this.messagesService.getPrivateUsersByid(user.user.uuid, data.receiverId));
  }

//# GROUPS
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('groupJoin')
  async handleGroupJoin(@ConnectedSocket() socket: Socket, @MessageBody() data: GroupJoinDto, @UserDecorator() user : { user : UserDto} ) {
    // check if baned or already member
    let member = await this.messagesService.getGroupMemberById(data.groupId, user.user.uuid)
    if (member.length && member[0].is_ban) throw new NotAcceptableException('cannot join this room.')
    if (member.length) throw new NotAcceptableException('already member.')
    let error = await this.messagesService.CheckJoinGroupII({ user_id : user.user.uuid, group_id : data.groupId, password : data.password })
    if (error !== true) {
      throw new NotAcceptableException(error)
    }
    member = this.messagesService.JoinGroup({ user_id : user.user.uuid, group_id : data.groupId, password : data.password, is_admin : false, is_owner : false }, false);
    // if successfully join the group
    socket.join(`group-${data.groupId}`);
    // inform group members
    this.server.to(`group-${data.groupId}`).emit('groupMember', member[0])
    socket.emit('groupJoin', (await this.messagesService.getGroupbyId(data.groupId))[0]);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('groupLeave')
  async handleGroupLeave(@ConnectedSocket() socket: Socket, @MessageBody() data: GroupLeaveDto, @UserDecorator() user : { user : UserDto}) {
    // if is owner set another member as owner or drop the room
    let member = await this.messagesService.getGroupMemberById(data.groupId, user.user.uuid)
    if (!member.length) throw new NotFoundException('group id not found')
    await this.messagesService.DropGroupMember({ ...member[0] })
    socket.leave(`group-${data.groupId}`)
    if (member[0].is_owner) {
      let nextowner = await this.messagesService.ChooseNextOwner({ group_id : data.groupId })
      if (!nextowner[0].member_id) {
        // if group deleted no member found
        this.server.to(`connected`).emit('groupDeleted', nextowner[0])
      } else {
        // if owner changed
        this.server.to(`group-${data.groupId}`).emit('newGroupOwner', nextowner[0])
      }
    }
    // emit kicked to current user
    this.server.to(`user-${user.user.uuid}`).emit('kicked', member[0]);
  }

  @UseGuards()
  @SubscribeMessage('kick')
  async KickMember(@ConnectedSocket() socket: Socket, @MessageBody() body: KickMemberDto, @UserDecorator() user : { user : UserDto}) {
      // check if current user is admin or owner
      let admin = await this.messagesService.getGroupMemberById(body.group_id, user.user.uuid)
      if (!admin.length) throw new NotFoundException('group id not found');
      if (!admin[0].is_admin) throw new ForbiddenException('owner/admin only can access this action');
      // check if member not owner
      let member = await this.messagesService.getGroupMemberById(body.group_id, body.member_id);
      if (!member.length) throw new NotFoundException('member id not found')
      if (member[0].is_owner || member[0].is_admin) throw new ForbiddenException('cannot kick owners.');
      // update member
      await this.messagesService.DropGroupMember({ ...member[0]})
      // inform user
      this.server.to(`user-${body.member_id}`).emit('kicked', member[0]);
      // disconnect all user sockets from group room
      // inform other members
      // inform via websockets
      this.server.to(`group-${body.group_id}`).emit('kickGroupMember', member[0])   
  }

  @UseGuards()
  @SubscribeMessage('kicked')
  async onKicked(@ConnectedSocket() socket: Socket, @MessageBody() body: KickMemberDto, @UserDecorator() user : { user : UserDto}) {
    // check if kicked
    let member = await this.messagesService.getGroupMemberById(body.group_id, user.user.uuid)
    if (!member.length)
      socket.leave(`group-${body.group_id}`)
  }

};
