import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friend.dto';
import { UpdateFriendshipDto } from './dto/update-friend.dto';
import { Friend, FriendshipStatus } from './entities/friend.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepo: Repository<Friend>,
    private readonly usersService: UserService,
  ) {}

  async findSentFriendship(u_id: string, f_id: string): Promise<Friend | null> {
    const friendship: Friend = await this.friendsRepo
      .createQueryBuilder('friend')
      .select()
      .where('friend.user_id = :u_id AND friend.friend_id = :f_id', {
        u_id: u_id,
        f_id: f_id,
      })
      .getOne();
    return friendship || null;
  }

  async findFriendship(u_id: string, f_id: string): Promise<Friend | null> {
    const friendship: Friend = await this.friendsRepo
      .createQueryBuilder('friend')
      .select()
      .where('friend.user_id = :u_id AND friend.friend_id = :f_id', {
        u_id: u_id,
        f_id: f_id,
      })
      .orWhere('friend.user_id = :f_id AND friend.friend_id = :u_id', {
        f_id: f_id,
        u_id: u_id,
      })
      .getOne();
    return friendship || null;
  }

  async getFriends(u_id: string): Promise<User[]> {
    const friendships: Friend[] = await this.friendsRepo
      .createQueryBuilder('friend')
      .select('uuid, user_id, friend_id, status, timestamp')
      .where(
        '(friend.user_id = :u_id OR friend.friend_id = :u_id) AND friend.status = :status',
        {
          u_id: u_id,
          status: FriendshipStatus.FRIEND,
        },
      )
      .getRawMany();
    let result = [];
    let user: User;
    for (let friendship of friendships) {
      if (friendship.user_id == u_id)
        user = await this.usersService.findUser(friendship.friend_id);
      else user = await this.usersService.findUser(friendship.user_id);
      result.push(user);
    }
    return result;
  }

  async getBlockedUsers(u_id: string): Promise<User[]> {
    const friendships: Friend[] = await this.friendsRepo
      .createQueryBuilder('friend')
      .select('uuid, user_id, friend_id, status, timestamp')
      .where('friend.user_id = :u_id AND friend.status = :status', {
        u_id: u_id,
        status: FriendshipStatus.BLOCKED,
      })
      .getRawMany();
    let result = [];
    for (let friendship of friendships) {
      const user = await this.usersService.findUser(friendship.friend_id);
      result.push(user);
    }
    return result;
  }

  async getPendingInvitations(u_id: string): Promise<User[]> {
    const friendships: Friend[] = await this.friendsRepo
      .createQueryBuilder('friend')
      .select('uuid, user_id, friend_id, status, timestamp')
      .where('friend.friend_id = :u_id AND friend.status = :status', {
        u_id: u_id,
        status: FriendshipStatus.PENDING,
      })
      .getRawMany();
    let result = [];
    for (let friendship of friendships) {
      const user = await this.usersService.findUser(friendship.user_id);
      result.push(user);
    }
    return result;
  }

  async create(
    u_id: string,
    f_id: string,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    const friendship: Friend = await this.findFriendship(u_id, f_id);
    if (friendship)
      return {
        success: false,
        msg: 'Friendship exists',
      };
    const friendshipDto: CreateFriendshipDto = {
      user_id: u_id,
      friend_id: f_id,
    };
    const newFriend = this.friendsRepo.create(friendshipDto);
    return {
      success: true,
      msg: 'Friendship created',
      data: await this.friendsRepo.save(newFriend),
    };
  }

  async udpate(
    uuid: string,
    updateFriendshipDto: UpdateFriendshipDto,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    const friendship = await this.friendsRepo.preload({
      uuid: uuid,
      ...updateFriendshipDto,
    });
    if (!friendship) return { success: false, msg: 'Friendship not found' };
    else
      return {
        success: true,
        msg: 'Friendship updated',
        data: await this.friendsRepo.save(friendship),
      };
  }

  async updateFriendshipStatus(
    u_id: string,
    f_id: string,
    status: FriendshipStatus,
    date: string = null,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    const friendship: Friend = await this.findFriendship(u_id, f_id);
    if (friendship) {
      const updateFriendshipDto: UpdateFriendshipDto = {
        status: status,
        timestamp: date,
      };
      return await this.udpate(friendship.uuid, updateFriendshipDto);
    } else return { success: false, msg: 'Friendship not found' };
  }

  async blockUser(
    u_id: string,
    f_id: string,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    await this.remove(u_id, f_id);
    await this.create(u_id, f_id);
    return await this.updateFriendshipStatus(
      u_id,
      f_id,
      FriendshipStatus.BLOCKED,
    );
  }

  async getFriendshipStatus(
    u_id: string,
    f_id: string,
  ): Promise<{ success: boolean; status: FriendshipStatus; data?: Friend }> {
    const friendship: Friend = await this.findFriendship(u_id, f_id);
    if (friendship)
      return { success: true, status: friendship.status, data: friendship };
    else return { success: true, status: FriendshipStatus.NONE };
  }

  async remove(
    u_id: string,
    f_id: string,
  ): Promise<{ success: boolean; msg: string; data?: Friend }> {
    const friendship: Friend = await this.findFriendship(u_id, f_id);
    if (friendship)
      return {
        success: true,
        msg: 'Friendship removed',
        data: await this.friendsRepo.remove(friendship),
      };
    else return { success: false, msg: 'Friendship not found' };
  }
}
