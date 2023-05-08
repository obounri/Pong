import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { IdDto } from './dto/create-friend.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UserDecorator } from 'src/user/user.decorater';
import { UserDto } from 'src/user/entities/user.dto';
import { Friend, FriendshipStatus } from './entities/friend.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFriends(@UserDecorator() user: UserDto): Promise<User[]> {
    return await this.friendsService.getFriends(user.uuid);
  }

  @Get('blocked')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@UserDecorator() user: UserDto): Promise<User[]> {
    return await this.friendsService.getBlockedUsers(user.uuid);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInvitations(@UserDecorator() user: UserDto): Promise<User[]> {
    return await this.friendsService.getPendingInvitations(user.uuid);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addFriend(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return await this.friendsService.create(user.uuid, idDto.id);
  }

  @Post('reject')
  @UseGuards(JwtAuthGuard)
  async rejectFriendship(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return this.friendsService.remove(user.uuid, idDto.id);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelFriendship(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    const friendship = await this.friendsService.findFriendship(
      user.uuid,
      idDto.id,
    );
    if (!friendship || friendship.status !== 'pending_invite')
      return {
        success: false,
        msg: "Can't cancel the invitation, refresh the page.",
      };
    return await this.friendsService.remove(user.uuid, idDto.id);
  }

  @Post('block')
  @UseGuards(JwtAuthGuard)
  async blockUser(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return await this.friendsService.blockUser(user.uuid, idDto.id);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  async acceptFriendship(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return await this.friendsService.updateFriendshipStatus(
      user.uuid,
      idDto.id,
      FriendshipStatus.FRIEND,
      Date(),
    );
  }

  @Post('unblock')
  @UseGuards(JwtAuthGuard)
  async unblockUser(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    if (await this.friendsService.findSentFriendship(user.uuid, idDto.id))
      return await this.friendsService.remove(user.uuid, idDto.id);
    else return { success: false, msg: 'Friendship not found' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFriendshipStatus(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{
    success: boolean;
    status?: FriendshipStatus;
    msg?: string;
    data?: Friend;
  }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return await this.friendsService.getFriendshipStatus(user.uuid, idDto.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @UserDecorator() user: UserDto,
    @Body() idDto: IdDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    if (user.uuid === idDto.id)
      return { success: false, msg: 'Self reference' };
    return await this.friendsService.remove(user.uuid, idDto.id);
  }
}
