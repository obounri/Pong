import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { JwtAuthModule } from "src/jwt/jwt-auth.module";
import { Jwt2faAuthModule } from "src/jwt/2fa-auth.module";

@Module({
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), JwtAuthModule, Jwt2faAuthModule],
  exports: [UserService],
  controllers: [UserController],
})

export class UsersModule {}
