import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';
import { CreateTokenDto } from './dtos/create-token';

@Injectable()
export class ApiTokensService {
  constructor(private prisma: PrismaService) {}

  async createApiToken({ name }: CreateTokenDto) {
    const token = await this.listApiTokens();
    if (token.length >= 5) {
      throw new BadRequestException('Tokens limit excised');
    }

    return this.prisma.apiToken.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        token: true,
        createdAt: true,
      },
    });
  }

  listApiTokens() {
    return this.prisma.apiToken.findMany({
      select: {
        id: true,
        name: true,
        token: true,
        createdAt: true,
      },
    });
  }

  async deleteApiToken(token: string) {
    const apiToken = await this.prisma.apiToken.findUnique({
      where: {
        token,
      },
    });
    if (!apiToken) throw new BadRequestException('Invalid token');
    await this.prisma.apiToken.delete({
      where: {
        id: apiToken.id,
      },
    });
  }
}
