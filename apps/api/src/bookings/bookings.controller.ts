import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { BookingStatus, User } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto)
  }

  @Get('my')
  getMyBookings(@CurrentUser() user: User, @Query('status') status?: BookingStatus) {
    return this.bookingsService.getClientBookings(user.id, status)
  }

  @Get('barbershop/:id')
  getBarbershopBookings(
    @Param('id') barbershopId: string,
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    return this.bookingsService.getBarbershopBookings(barbershopId, user.id, date)
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.getBookingById(id, user.id)
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updateStatus(id, user.id, status)
  }
}
