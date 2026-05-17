import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { User } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { HaircutHistoryService } from './haircut-history.service'

@Controller('haircut-records')
export class HaircutHistoryController {
  constructor(private readonly haircutHistoryService: HaircutHistoryService) {}

  @Post()
  createRecord(
    @CurrentUser() user: User,
    @Body()
    body: {
      clientId: string
      barbershopId: string
      bookingId?: string
      serviceNames: string[]
      notes?: string
    },
  ) {
    return this.haircutHistoryService.createRecord(user.id, body)
  }

  @Post(':id/photos')
  addPhoto(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
    @Body() body: { url: string; caption?: string },
  ) {
    return this.haircutHistoryService.addPhoto(recordId, user.id, body.url, body.caption)
  }

  @Get('client/:clientId')
  getClientHistory(@Param('clientId') clientId: string, @CurrentUser() user: User) {
    return this.haircutHistoryService.getClientHistory(clientId, user.id)
  }

  @Delete('photos/:photoId')
  deletePhoto(@Param('photoId') photoId: string, @CurrentUser() user: User) {
    return this.haircutHistoryService.deletePhoto(photoId, user.id)
  }
}
