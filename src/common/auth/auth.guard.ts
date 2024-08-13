import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

import { env } from '../env';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiToken = req.headers['x-api-token'] as string;
    if (!apiToken) {
      throw new UnauthorizedException();
    }

    const API_ADMIN_TOKEN = env.API_ADMIN_TOKEN;
    if (apiToken === API_ADMIN_TOKEN) {
      return true;
    }

    const tokenExists = await this.prisma.apiToken.findUnique({
      where: {
        token: apiToken,
      },
    });

    if (!tokenExists) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
