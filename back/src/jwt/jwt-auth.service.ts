import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/entities/user.dto';

@Injectable()
export class JwtAuthService {
	constructor(
		private jwtService: JwtService,
		private readonly configService: ConfigService
	) { }

	verify(token: string): any {
		return this.jwtService.verify(token, this.configService.get('JWT_SECRET_KEY'));
	}

	setJwt(user: UserDto): string {
		return this.jwtService.sign({user});
	}
}