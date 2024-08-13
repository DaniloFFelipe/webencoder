import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/auth/auth.guard';
import { CreateAssetDto, CreateAssetDtoSchema } from './dtos/create-asset.dto';
import { AssetsService } from './assets.service';
import { ZodValidationPipe } from 'src/common/validation/zod-validation-pipe';
import { Pagination, paginationSchema } from 'src/common/pagination';

@Controller('assets')
export class AssetsController {
  constructor(private service: AssetsService) {}

  @UsePipes(new ZodValidationPipe(CreateAssetDtoSchema))
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: CreateAssetDto) {
    return this.service.createAsset(body);
  }

  @Get('/:id/stream')
  async stream(@Param('id') id: string, @Res() res) {
    const { asset } = await this.service.getAsset(id);
    return res.status(302).redirect(`/content${asset.encodedLocation}`);
  }

  @Get('/:id/upload')
  @UseGuards(AuthGuard)
  async toStorage(@Param('id') id: string) {
    const { asset } = await this.service.uploadToStorage(id);
    return { asset };
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async index(@Param('id') id: string) {
    const { asset } = await this.service.getAsset(id);
    return { asset };
  }

  @HttpCode(204)
  @Delete('/:id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    await this.service.deleteAsset(id);
  }

  @UsePipes(new ZodValidationPipe(paginationSchema, 'query'))
  @Get('/')
  @UseGuards(AuthGuard)
  async list(@Query() { pageIndex, perPage }: Pagination) {
    return this.service.listAssets(
      Number(pageIndex ?? '0'),
      Number(perPage ?? '20'),
    );
  }
}
