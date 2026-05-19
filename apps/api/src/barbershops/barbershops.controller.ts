import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { UserRole, User } from '../generated/prisma'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { BarbershopsService } from './barbershops.service'
import { CreateBarbershopDto, UpdateBarbershopDto } from './dto/create-barbershop.dto'

@Controller('barbershops')
export class BarbershopsController {
  constructor(private readonly barbershopsService: BarbershopsService) {}

  @Public()
  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.barbershopsService.findAll({
      city,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    })
  }

  @Public()
  @Get(':slug/profile')
  findBySlug(@Param('slug') slug: string) {
    return this.barbershopsService.findBySlug(slug)
  }

  @Get('my')
  @Roles(UserRole.BARBERSHOP_OWNER)
  getMyBarbershop(@CurrentUser() user: User) {
    return this.barbershopsService.getMyBarbershop(user.id)
  }

  @Post()
  @Roles(UserRole.BARBERSHOP_OWNER)
  create(@CurrentUser() user: User, @Body() dto: CreateBarbershopDto) {
    return this.barbershopsService.create(user.id, dto)
  }

  @Patch(':id')
  @Roles(UserRole.BARBERSHOP_OWNER)
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateBarbershopDto) {
    return this.barbershopsService.update(id, user.id, dto)
  }

  @Public()
  @Get(':id/availability')
  getAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('barberId') barberId?: string,
  ) {
    return this.barbershopsService.getAvailability(id, date, barberId)
  }
}
