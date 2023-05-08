import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  getStatus(@Res({ passthrough: true }) res: Response) {
    return res.redirect(
      `${this.configService.get<string>('SERVER_IP')}/auth/status`,
    );
  }
}
