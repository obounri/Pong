import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UserDecorator } from 'src/user/user.decorater';
import { UserDto } from 'src/user/entities/user.dto';
import { Message, Group } from './entities/message.entity';
import { MessagesGateway } from './messages.gateway';
import { NotFoundException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { ActionMemberDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly MessagesService: MessagesService, 
    private readonly MessagesGateway : MessagesGateway) {}
  
  // # private inbox
  @Get('/privateConversation/users')
  @UseGuards(JwtAuthGuard)
  async getPrivateUsers(@UserDecorator() user: UserDto) {
    // user must not see users blocked users
    return await this.MessagesService.getPrivateUsers(user.uuid);
  }

  @Get('/privateConversation/:userId')
  @UseGuards(JwtAuthGuard)
  async getPrivateMessages(@Param('userId') userId, @Query('pageId') pageId : string, @UserDecorator() user: UserDto) {
    if (pageId === undefined || !/^[\d]+$/.test(pageId) || parseInt(pageId) < 1) pageId = '1';
    return await this.MessagesService.getPrivateMessages(user.uuid, userId, parseInt(pageId));
  }

  // # groups
  @Get('/groups')
  @UseGuards(JwtAuthGuard)
  async getGroups(@UserDecorator() user : UserDto) {
    // user must not see group that ban him
    return this.MessagesService.getGroups(user.uuid);
  }

  @Post('/group')
  @UseGuards(JwtAuthGuard)
  async CreateGroup(@UserDecorator() user : UserDto, @Body() body :  
  { name : string, type : 'public' | 'protected' | 'private', password : string | undefined }) {
    // create the room
    if (!body.name || !/^[A-Za-z\d\ ]{1,200}$/.test(body.name)) throw new NotAcceptableException('name is required or has unexpected characters.')
    if (!body.type || !/^public$|^protected$|^private$/.test(body.type)) throw new NotAcceptableException('type is required or has unexpected characters.')
    if (body.type === 'protected' && (!body.password || body.password.length < 6 || body.password.length > 16)) throw new NotAcceptableException('password is required, length 6-16 characters.')
    let resData =  await this.MessagesService.createGroup(body, user.uuid);
    // inform other users
    if (body.type !== 'private')
      this.MessagesGateway.server.to('connected').emit(
        'new-group',
        resData[0]
      );
    return resData[0];
  }

  @Patch('/group')
  @UseGuards(JwtAuthGuard)
  async UpdateGroup(@UserDecorator() user : UserDto, @Body() body :  
  { id : string, name : string, type : 'public' | 'protected' | 'private', password : string | undefined }) {
    // update room
    if (!body.id || !/^[\d]+$/.test(body.id)) throw new NotAcceptableException('id is required.')
    if (!body.name || !/^[A-Za-z\d\ ]{1,200}$/.test(body.name)) throw new NotAcceptableException('name is required or has unexpected characters.')
    if (!body.type || !/^public$|^protected$|^private$/.test(body.type)) throw new NotAcceptableException('type is required or has unexpected characters.')
    if (body.type === 'protected' && (!body.password || body.password.length < 6 || body.password.length > 16)) throw new NotAcceptableException('password is required, length 6-16 characters.')
    // check user is only owner
    let resData =  await this.MessagesService.updateGroup({ ...body, id : parseInt(body.id)}, user.uuid);
    // inform other users with the update
    this.MessagesGateway.server.to('connected').emit(
      'updated-group',
      resData[0]
    );
    return resData[0];
  }

  // groups messages
  @Get('/group/messages/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupMessages(@Param('groupId') groupId, @Query('pageId') pageId : string, @UserDecorator() user: UserDto) {
    if (!/^[\d]+$/.test(groupId)) throw new NotFoundException('group id not found.')
    if (pageId === undefined || !/^[\d]+$/.test(pageId) || parseInt(pageId) < 1) pageId = '1';
    // user must not see messages from blocked users
    return await this.MessagesService.getGroupMessages(groupId, parseInt(pageId), user.uuid)
  }

  @Post('/group/messages/:groupId')
  @UseGuards(JwtAuthGuard)
  async createGroupMessage(@Param('groupId') groupId, @Body() body : { message : string}, @UserDecorator() user: UserDto) {
    if (!/^[\d]+$/.test(groupId)) throw new NotFoundException('group id not found.')
    let message = await this.MessagesService.createGroupMessage(user.uuid, groupId, body.message);
    this.MessagesGateway.server.to(`group-${groupId}`).emit('groupMessage', message[0])
    return message[0];
  }

  // members
  @Get('/group/members/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupDetails(@Param('groupId') groupId , @UserDecorator() user: UserDto) {
    // user must not see blocked users
    if (!/^[\d]+$/.test(groupId)) throw new NotFoundException('unexpected group id.')
    return await this.MessagesService.getGroupMembers(groupId, user.uuid)
  }

  // set as admin or not admin
  @Patch('/group/members/:groupId')
  @UseGuards(JwtAuthGuard)
  async UpdateMemberRole(
  @Param('groupId') groupId,
  @Body() body : { member_id : string, is_admin : boolean }, @UserDecorator() user: UserDto) {
    // check if current user is owner only
    let Owner = await this.MessagesService.getGroupMemberById(groupId, user.uuid);
    if (!Owner.length) throw new NotFoundException('group id not found');
    if (!Owner[0].is_owner) throw new ForbiddenException('only owner can access this action');
    let member = await this.MessagesService.getGroupMemberById(groupId, body.member_id);
    if (!member.length) throw new NotFoundException('member not found')
    if (member[0].is_owner) throw new ForbiddenException('cannot update owner.');
    // update member role
    member = await this.MessagesService.UpdateMember({ ...member[0], is_admin : body.is_admin })
    // inform via websockets
    // this.MessagesGateway.server.to(`group-${groupId}`).emit('groupMember', member[0])
    this.MessagesGateway.server.to(`group-${groupId}`).emit('updateGroupMember', member[0])
    return member[0];
  }

  // invite user
  @Post('/group/member/invite')
  @UseGuards(JwtAuthGuard)
  async GroupInvite(@Body() body : { group_id : number, user_id : string }, @UserDecorator() user: UserDto) {
    // check if current user is owner 
    let admin = await this.MessagesService.getGroupMemberById(body.group_id, user.uuid)
    if (!admin.length) throw new NotFoundException('group id not found');
    if (!admin[0].is_owner) throw new ForbiddenException('owner only can access this action');
    // check if already member
    let member = await this.MessagesService.getGroupMemberById(body.group_id, body.user_id);
    if (member.length) throw new NotFoundException('already member')
    // create member without password
    member = await this.MessagesService.JoinGroup({ user_id : body.user_id, group_id : body.group_id, is_owner : false, is_admin : false, password : '' }, false)
    // inform members
    this.MessagesGateway.server.to(`group-${body.group_id}`).emit('GroupMember', member[0])
    // inform invited user
    this.MessagesGateway.server.to(`user-${body.user_id}`).emit('inviteGroup', (await this.MessagesService.getGroupbyId(body.group_id))[0]);
    return member[0]
  }

  // mute or ban member
  @Patch('/group/action/member')
  @UseGuards(JwtAuthGuard)
  async GroupActions(@Body() body : ActionMemberDto, @UserDecorator() user: UserDto) {
    // check if current user is admin or owner
    let admin = await this.MessagesService.getGroupMemberById(body.group_id, user.uuid)
    if (!admin.length) throw new NotFoundException('group id not found');
    if (!admin[0].is_admin) throw new ForbiddenException('owner/admin only can access this action');
    // check if member not owner
    let member = await this.MessagesService.getGroupMemberById(body.group_id, body.member_id);
    if (!member.length) throw new NotFoundException('member id not found')
    if (member[0].is_owner || member[0].is_admin) throw new ForbiddenException('cannot update owners.');
    // update member
    if (!body.mute_time_minute || body.mute_time_minute < 0)
      body.mute_time_minute = 0
    member = await this.MessagesService.MemberAction({ ...member[0], is_ban : body.is_ban, mute_time_minute : body.mute_time_minute})
    // inform other members
    // inform via websockets
    if (body.is_ban) // send kicked to the target user
      this.MessagesGateway.server.to(`user-${body.member_id}`).emit('kicked', member[0])
    this.MessagesGateway.server.to(`group-${body.group_id}`).emit('updateGroupMember', member[0])
    return member[0];
  }
}