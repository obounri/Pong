import { User } from './../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message, Group } from './entities/message.entity';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MessagesService {
  private readonly saltRounds = 10;
  private readonly messages = new Map<string, any>()
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // to remove
  // async getUserMessages(userId: number): Promise<Message[]> {
  //   // Get the user's sent and received messages
  //   const messages = await this.messageRepository
  //     .createQueryBuilder('message')
  //     .leftJoinAndSelect('message.sender', 'sender')
  //     .leftJoinAndSelect('message.recipient', 'recipient')
  //     .where('sender.id = :userId OR recipient.id = :userId', { userId })
  //     .orderBy('message.timestamp', 'DESC')
  //     .getMany();

  //   // Get the user's group messages

  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ['groups', 'groups.messages'],
  //   });
  //   const groupMessages = user?.groups.reduce((acc, group) => {
  //     if (group.password) {
  //       // Group is protected, don't include messages
  //       return acc;
  //     }
  //     // return acc.concat(group.messages);
  //   }, []);

  //   // Combine and sort all messages by timestamp
  //   const allMessages = messages.concat(groupMessages);
  //   return allMessages.sort(
  //     (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  //   );
  // }
  // to remove
  async addUserToGroup(userId: number, groupId: number, password: string) {
    // Add a user to a group
    if (password === 'secret') {
      // replace this with your own logic to check the password
      return { success: true };
    } else {
      return null;
    }
  }

  async createPrivateMessage(
    senderId: string,
    receiverId: string,
    message: string,
  ) {
    // Create a private message between two users
    return await this.messageRepository.query(
      'insert into message (content, "senderUuid", "recipientUuid") values ($1, $2, $3) returning *',
      [ message, senderId, receiverId ]
    )
  }

  async getPrivateUsers(userId : string) {
    return await this.messageRepository
    .query(
      `
      select
      "users"."uuid",
      "users"."firstName",
      "users"."lastName",
      "users"."username",
      "users"."status",
      "users"."avatarUrl",
      "users"."xp",
      (
        SELECT json_build_object(
          'id', message.id,
          'content', message.content, 
          'timestamp', message.timestamp, 
          'senderUuid', message."senderUuid",
          'recipientUuid', message."recipientUuid",
          'messagesCount', (select COUNT(*) from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid ) )
        ) from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid  ) ORDER BY message.id DESC limit 1 
      ) as "lastMessage"
      from users join friends on (friends.status = 'friend'::friends_status_enum and (friends.friend_id::uuid = $1::uuid or friends.user_id::uuid = $1::uuid) and (friends.friend_id::uuid = "users"."uuid"::uuid or friends.user_id::uuid = "users"."uuid"::uuid))
      where "users"."uuid"::uuid != $1::uuid and exists ( select true from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid ) ORDER BY message.id DESC limit 1)
      group by users."uuid"
      `,
      [ userId ]
    )
  }

  async getPrivateUsersByid(userId : string, friendId : string) {
    return await this.messageRepository
    .query(
      `
      select
      "users"."uuid",
      "users"."firstName",
      "users"."lastName",
      "users"."username",
      "users"."status",
      "users"."avatarUrl",
      "users"."xp",
      (
        SELECT json_build_object(
          'id', message.id,
          'content', message.content, 
          'timestamp', message.timestamp, 
          'senderUuid', message."senderUuid",
          'recipientUuid', message."recipientUuid",
          'messagesCount', (select COUNT(*) from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid ) )
        ) from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid  ) ORDER BY message.id DESC limit 1 
      ) as "lastMessage"
      from users join friends on (friends.status = 'friend'::friends_status_enum and (friends.friend_id::uuid = $1::uuid or friends.user_id::uuid = $1::uuid) and (friends.friend_id::uuid = "users"."uuid"::uuid or friends.user_id::uuid = "users"."uuid"::uuid))
      where "users"."uuid"::uuid = $2::uuid and exists ( select true from message where ( "recipientUuid"::uuid = $1::uuid or "senderUuid"::uuid = $1::uuid) AND ( "recipientUuid"::uuid = "users"."uuid"::uuid or "senderUuid"::uuid = "users"."uuid"::uuid ) ORDER BY message.id DESC limit 1)
      group by users."uuid"
      `,
      [ userId, friendId ]
    )
  }

  async getPrivateMessages(userId : string, friendId : string, pageId : number) {
    return await this.messageRepository.query(
    `select message.*
    from message
    where ("recipientUuid" = $1 or "senderUuid" = $1) and ("recipientUuid" = $2 or "senderUuid" = $2)
    ORDER BY message.id DESC limit 50 offset ${ (pageId - 1) * 50} `,
    [ userId, friendId ])
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  async createGroup(body :  
  { name : string, type : 'public' | 'protected' | 'private', password : string | undefined }, sessionUserId : string) {
      let group = await this.messageRepository.query(
        'insert into "group" (name, "isPasswordProtected", password, "isPrivate") values ($1, $2, $3, $4) returning *',
        [ body.name, body.type === 'protected', body.type === 'protected' ? await this.hashPassword(body.password) : null, body.type === 'private' ]
      )
      // create first member will be owner
      await this.JoinGroup({ user_id : sessionUserId, group_id : group[0].id, is_owner : true, is_admin : true, password : ''}, false);
      return group;
  }

  async updateGroup(body :  
    { id : number, name : string, type : 'public' | 'protected' | 'private',
    password : string | undefined }, sessionUserId : string) {
      let group = await this.messageRepository.query(
        `
        update "group" set name=$1, "isPasswordProtected"=$2, password=$3, "isPrivate"=$5 where id = $4 
        and exists ( select true from "group_members" where group_id = $4 and member_id = ${sessionUserId} and is_owner = true ) returning *
        `,
        [ body.name, body.type === 'protected', body.type === 'protected' ? await this.hashPassword(body.password) : null , body.id, body.type === 'private']
      )
      if (!group[1]) throw new NotFoundException("group id not found")
      return group[0];
  }

  async CheckJoinGroup(body : { user_id : string, group_id : number, password : string | undefined }) {
    let group = await this.getGroupbyId(body.group_id);
    if (!group.length) throw new NotFoundException("group not found")
    if (group[0].isPrivate) throw new ForbiddenException('cannot join private room')
    if (group[0].isPasswordProtected && !(await this.comparePasswords(body.password, group[0].password))) throw new ForbiddenException('Password is incorrect')
    return true
  }

  async CheckJoinGroupII(body : { user_id : string, group_id : number, password : string | undefined }) {
    let group = await this.getGroupbyId(body.group_id);
    if (!group.length) return "group not found";
    if (group[0].isPrivate) return 'cannot join private room';
    if (group[0].isPasswordProtected && !(await this.comparePasswords(body.password, group[0].password))) return 'Password is incorrect';
    return true
  }

  async JoinGroup(body :  { user_id : string, group_id : number, is_owner : boolean | undefined, is_admin : boolean | undefined, password : string | undefined}, checkJoin : boolean = true) {
    checkJoin && await this.CheckJoinGroup(body)
    let user = await this.messageRepository.query('select true from users where uuid = $1::uuid', [ body.user_id ])
    if (!user.length) throw new NotFoundException('user id not found')
    await this.messageRepository.query(
      'insert into group_members (group_id, member_id, is_owner, is_admin) values ($1, $2, $3, $4) returning *',
      [ body.group_id, body.user_id, body.is_owner || false, body.is_admin || false ]
    )
    return await this.getGroupMemberById(body.group_id, body.user_id);
  }

  async UpdateMember(body : { id : number, group_id : number, member_id : string, is_owner : boolean | undefined, is_admin : boolean | undefined}) {
    await this.messageRepository.query(
      'update group_members set is_owner = $1, is_admin = $2 where id = $3',
      [ body.is_owner || false, body.is_admin || false, body.id ]
    )
    return await this.getGroupMemberById(body.group_id, body.member_id);
  }

  async MemberAction(body : { id : number, group_id : number, member_id : string, is_ban : boolean, mute_time_minute : number}) {
    await this.messageRepository.query(
      `update group_members set is_ban = $1, mute_time = CURRENT_TIMESTAMP + INTERVAL '${body.mute_time_minute || 0} Minute' where id = $2`,
      [ body.is_ban || false, body.id ]
    )
    return await this.getGroupMemberById(body.group_id, body.member_id);
  }

  async DropGroupMember( body : { id : number}) {
    return await this.messageRepository.query(
      'delete from group_members where id = $1 returning *',
      [ body.id ]
    )
  }

  async getGroupbyId(id : number) {
    // check for baned members
    return await this.messageRepository.query(
      'select g.id, g.name, g."isPasswordProtected", g."password", g."isPrivate", (select count(*) from group_members gm where "gm".group_id = "g".id) as membersCount from "group" "g" where g.id = $1 order by id DESC',
      [ id ]
    )
  }

  async getGroups(sessionUserId : string) {
    // check for baned members
    return await this.messageRepository.query(
      `
      select g.id, g.name, g."isPasswordProtected", 
      (select count(*) from group_members gm where "gm".group_id = "g".id) as membersCount,
      COALESCE((select true from group_members where group_members.group_id = "g".id and group_members.member_id::uuid = '${sessionUserId}'::uuid limit 1), 'false'::boolean) as "isMember",
      (select json_build_object(
        'username', "users"."username",
        'content', gm."content",
        'senderId', gm."senderId", 
        'groupId', gm."groupId", 
        'created_at', gm.created_at
      ) from group_message gm, users where users.uuid = gm."senderId"::uuid
      -- check is member
      and exists ( select true from group_members where group_members.group_id = "g".id and group_members.member_id::uuid = '${sessionUserId}'::uuid limit 1)
      -- check if blocked
      and ( gm."senderId"::uuid = '${sessionUserId}'::uuid 
      or not exists ( select true from friends where (friends.user_id = '${sessionUserId}' or friends.friend_id = '${sessionUserId}' ) 
      and ( friends.user_id = gm."senderId" or friends.friend_id = gm."senderId" ) and status = 'blocked'::friends_status_enum limit 1 ) )
      and gm."groupId" = "g".id order by gm.created_at DESC limit 1 ) as "lastMessage"
      from "group" "g" 
      -- check if baned
      order by id DESC
      `
    )
  }

  async getGroupMemberById(groupId : number, userId : string) {
    return await this.messageRepository.query(
      `
      select
        gm.*,
        u."uuid" user_id,
        u."firstName",
        u."lastName",
        u."username",
        u."email",
        u."xp",
        u."status",
        u."avatarUrl"
      from group_members gm, users u where gm.group_id = $1 and gm.member_id::uuid = $2::uuid and u.uuid::uuid = gm.member_id::uuid order by joined_at asc
      `,
      [ groupId , userId]
    )
  }

  async getGroupMembers(groupId : number, sessionUserId : string) {
    // check if the current user is member and not baned
    let groupMember = null;
    if (!(groupMember = await this.isGroupMember(groupId, sessionUserId)))
      throw new UnauthorizedException('you must being member before access this action');
    return await this.messageRepository.query(
      `select
        gm.*,
        u."uuid" user_id,
        u."firstName",
        u."lastName",
        u."username",
        u."email",
        u."xp",
        u."status",
        u."avatarUrl"
      from group_members gm, users u where gm.group_id = $1 and u.uuid::uuid = gm.member_id::uuid order by joined_at asc
      `,
      [ groupId]
    )
  }

  async getGroupMessages(groupId : number, pageId : number, sessionUserId : string) {
    if (!(await this.isGroupMember(groupId, sessionUserId)))
      throw new UnauthorizedException('you must being member before access this action');
    // use sessionUserId to filter blocked users messages
    return await this.messageRepository.query(
      `select 
        group_message.*,
        users."username"
      from group_message, users
      where group_message."groupId" = $1 and users.uuid = group_message."senderId"::uuid 
      and ( group_message."senderId" = $2 or not exists ( select true from friends where (friends.user_id = $2 or friends.friend_id = $2 ) and ( friends.user_id = group_message."senderId" or friends.friend_id = group_message."senderId" ) and status = 'blocked'::friends_status_enum limit 1 ))
      ORDER BY group_message.id DESC limit 50 offset ${ (pageId - 1) * 50} `,
      [ groupId, sessionUserId])
  }

  async createGroupMessage(senderId: string, groupId: number, message: string) {
    // check if the current user is member and not baned and not muted
    let groupMember = null;
    if (!(groupMember = await this.isGroupMember(groupId, senderId)))
      throw new UnauthorizedException('you must being member before access this action');
    // if (this.isGroupMemberMuted(groupMember))
    if (new Date(groupMember.mute_time) > new Date())
      throw new UnauthorizedException(`you can\'t send messages right now until ${groupMember.mute_time}`);
    // Create a group message
    return await this.messageRepository.query(
      'insert into group_message (content, "senderId", "groupId") values ($1, $2, $3) returning *',
      [ message, senderId, groupId ]
    )
  }

  async getUserGroups(userId : string) {
      return await this.messageRepository.query(
        'select * from "group" where exists ( select true from group_members gm where "group"."id" = gm.group_id and "gm"."member_id"::uuid = $1::uuid and "gm".is_ban = false)',
        [ userId ]
      );
  }

  async isGroupMember(groupID : number, userId : string) {
    let groupMember = await this.messageRepository.query('select * from group_members where member_id = $1 and group_id = $2',
    [ userId, groupID ]);
    if (!groupMember.length || groupMember[0].is_ban) return false;
    return groupMember[0];
  }

  async isGroupMemberMuted(group : { id : number, member_id : string, mute_time : string}) {
    return new Date(group.mute_time) > new Date()// compare with current date
  }

  async ChooseNextOwner(body : {group_id : number}) {
    let nextowner = 
    await this.messageRepository.query('select * from group_members where group_id = $1 and is_owner = false order by is_admin DESC limit 1',
    [ body.group_id ]);
    // drop group if no member found
    if (!nextowner.length) {
      let group = await this.messageRepository.query('delete from "group" where id = $1 returning *', [ body.group_id])
      return group[0];
    }
    // set next admin or member as owner and admin
    await this.messageRepository.query('update group_members set is_owner = true, is_admin = true where id = $1', [nextowner[0].id])
    return await this.getGroupMemberById(body.group_id, nextowner[0].member_id);
  }
}
