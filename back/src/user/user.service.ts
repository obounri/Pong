import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto, UserDto } from 'src/user/entities/user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { authenticator } from 'otplib';
import { JwtAuthService } from 'src/jwt/jwt-auth.service';
import { Jwt2faAuthService } from 'src/jwt/2fa-auth.service';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtAuthService: JwtAuthService,
    private readonly jwt2faAuthService: Jwt2faAuthService,
  ) {}

  setJWT2faCookie(user: UserDto, res: Response): void {
    const accessToken: string = this.jwt2faAuthService.set2faJwt(user);
    res.cookie('jwt-2fa', accessToken, { httpOnly: true });
  }

  setJWTCookie(user: UserDto, res: Response): void {
    const accessToken: string = this.jwtAuthService.setJwt(user);
    res.cookie('jwt', accessToken, { httpOnly: true });
    res.clearCookie('jwt-2fa', { httpOnly: true });
  }

  async validateUser(userDetails: any): Promise<User | User[]> {
    userDetails = {
      ...userDetails,
      firstName: userDetails.firstName || userDetails.first_name,
      lastName: userDetails.lastName || userDetails.last_name,
    };

    const user = await this.userRepo.findOneBy({ email: userDetails.email });
    if (user) return user;
    const newUser = this.userRepo.create(userDetails);
    return await this.userRepo.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async findUser(uuid: string): Promise<User> {
    const user: User = await this.userRepo.findOneBy({ uuid: uuid });
    delete user?._2faSecret;
    if (user) return user;
    else throw new NotFoundException(`User ${uuid} not found`);
  }

  async UserProfile(SessionUserId: string, userId: string): Promise<User> {
    const user: User[] = await this.userRepo.query(
      'select * from readuserprofile($1, $2)',
      [SessionUserId, userId],
    );
    if (user.length) return user[0];
    else throw new NotFoundException(`User ${userId} not found`);
  }

  async readUserProfile(
    sessionUserId: string,
    userId: string,
  ): Promise<UserDto[]> {
    const query = this.userRepo
      .createQueryBuilder('users')
      .select([
        'uuid',
        '"firstName"',
        '"lastName"',
        '"username"',
        '"avatarUrl"',
        '"xp"',
        '"status"',
        '"firstLogin"',
        '"t_joined"',
        `(CASE
          WHEN (SELECT true FROM friends frd WHERE (frd.user_id = '${sessionUserId}' OR frd.friend_id = '${sessionUserId}') AND (frd.user_id::uuid = users.uuid OR frd.friend_id::uuid = users.uuid) AND frd.status = 'friend'::friends_status_enum) = true THEN 'friend'
          WHEN (SELECT true FROM friends frd WHERE (frd.user_id = '${sessionUserId}' OR frd.friend_id = '${sessionUserId}') AND (frd.user_id::uuid = users.uuid OR frd.friend_id::uuid = users.uuid) AND frd.status = 'blocked'::friends_status_enum) = true THEN 'blocked'
          WHEN (SELECT true FROM friends frd WHERE frd.user_id = '${sessionUserId}' AND frd.friend_id::uuid = users.uuid AND frd.status = 'pending_invite'::friends_status_enum) = true THEN 'pending_invite_sent'
          WHEN (SELECT true FROM friends frd WHERE frd.user_id::uuid = users.uuid AND frd.friend_id = '${sessionUserId}' AND frd.status = 'pending_invite'::friends_status_enum) = true THEN 'pending_invite_received'
          ELSE 'not_friend'
        END) AS friendship`,
      ])
      .where('users.uuid = :userId', { userId })
      .andWhere(
        `NOT EXISTS (SELECT true FROM friends WHERE friends.user_id::uuid = users.uuid AND friends.friend_id = '${sessionUserId}' AND friends.status = 'blocked'::friends_status_enum)`,
      );

    const users = await query.getRawMany<UserDto[]>();
    if (users.length) return users[0];
    throw new NotFoundException(`User ${userId} not found`);
  }

  async search(search: string, sessionUserId : string): Promise<any[]> {
    return await this.userRepo.query(
      `select 
        uuid,
        "firstName",
        "lastName",
        username,
        "avatarUrl",
        t_joined
      from users 
      where 
      -- is not blocked
      ( users.uuid != '${sessionUserId}'::uuid or not exists ( select true from friends where (user_id = '${sessionUserId}' or friend_id = '${sessionUserId}') and (user_id::uuid = users.uuid or friend_id::uuid = users.uuid) and status = 'blocked'::friends_status_enum limit 1 ) ) and 
      ( username ilike $1 or "firstName" ilike $1 or "lastName" ilike $1 or CONCAT("firstName", ' ',"lastName") ilike $1 or CONCAT("lastName", ' ', "firstName") ilike $1 )`,
      [`%${search.replace(' ', '%')}%`],
    );
  }

  async me(userId: string): Promise<any[]> {
    return await this.userRepo.query(
      `select * from "ReadUsersProfile" where uuid = $1::uuid`,
      [userId],
    );
  }

  async usernameIsUnique(uuid: string, username: string): Promise<boolean> {
    const user = await this.userRepo.findOneBy({ username: username });
    return user && user.uuid != uuid ? false : true;
  }

  async update(
    uuid: string,
    userDetails: UpdateUserDto,
  ): Promise<{ success: boolean; msg?: string; data?: User }> {
    const user = await this.userRepo.preload({
      uuid: uuid,
      ...userDetails,
    });
    if (!user)
      return {
        success: false,
        msg: `User ${uuid} not found`,
      };
    else
      return {
        success: true,
        data: await this.userRepo.save(user),
      };
  }

  async get2faSecret(id: string): Promise<string> {
    const user: User = await this.userRepo
      .createQueryBuilder('user')
      .select(['user._2faSecret'])
      .where('user.uuid = :id', { id: id })
      .getOne();
    return user?._2faSecret;
  }

  async set2faSecret(id: string, secret: string): Promise<UpdateResult> {
    return await this.userRepo
      .createQueryBuilder('user')
      .update({ _2faSecret: secret })
      .where('uuid = :id', { id: id })
      .execute();
  }

  async generate2faSecret(user: UserDto): Promise<void> {
    const secret: string = authenticator.generateSecret();
    await this.set2faSecret(user.uuid, secret);
  }

  async set2fa(
    user: UserDto,
    activate: boolean,
  ): Promise<{ data: boolean } | void> {
    if (activate === false) {
      await this.set2faSecret(user.uuid, null);
      await this.userRepo
        .createQueryBuilder('user')
        .update({ _2fa: activate })
        .where('uuid = :id', { id: user.uuid })
        .execute();
    } else return await this.generate2faSecret(user);
    return { data: true };
  }

  async set2faTrue(user: UserDto): Promise<{ data: boolean }> {
    await this.userRepo
      .createQueryBuilder('user')
      .update({ _2fa: true })
      .where('uuid = :id', { id: user.uuid })
      .execute();
    return { data: true };
  }

  async secretIsSet(userId: string): Promise<boolean> {
    const user: User = await this.userRepo
      .createQueryBuilder('user')
      .select(['user._2faSecret'])
      .where('user.uuid = :id', { id: userId })
      .getOne();
    if (
      user?._2faSecret === null ||
      user?._2faSecret === undefined ||
      user?._2faSecret === ''
    )
      return false;
    else return true;
  }
}
