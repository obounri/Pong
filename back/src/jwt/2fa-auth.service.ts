import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/entities/user.dto';

@Injectable()
export class Jwt2faAuthService {
	constructor(
		private jwtService: JwtService,
		private readonly configService: ConfigService
	) { }

	set2faJwt(user: UserDto): string {
		return this.jwtService.sign({user});
	}
}