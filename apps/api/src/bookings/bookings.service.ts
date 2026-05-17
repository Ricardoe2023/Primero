import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { BookingStatus } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(clientId: string, dto: CreateBookingDto) {
    const services = await this.prisma.service.findMany({
      where: { id: { in: dto.serviceIds }, barbershopId: dto.barbershopId, isActive: true },
    })

    if (services.length !== dto.serviceIds.length) {
      throw new BadRequestException('Uno o más servicios no válidos')
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
    const totalAmount = services.reduce((sum, s) => sum + s.price, 0)
    const scheduledAt = new Date(dto.scheduledAt)
    const endsAt = new Date(scheduledAt.getTime() + totalDuration * 60 * 1000)

    // Verificar que no hay conflicto de horario
    const conflict = await this.prisma.booking.findFirst({
      where: {
        barberId: dto.barberId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { scheduledAt: { lt: endsAt }, endsAt: { gt: scheduledAt } },
        ],
      },
    })

    if (conflict) throw new BadRequestException('El horario ya está ocupado')

    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        barbershopId: dto.barbershopId,
        barberId: dto.barberId,
        scheduledAt,
        endsAt,
        totalAmount,
        notes: dto.notes,
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            priceAtTime: s.price,
          })),
        },
      },
      include: {
        services: { include: { service: true } },
        barber: { include: { user: { select: { firstName: true, lastName: true } } } },
        barbershop: { select: { name: true, address: true } },
      },
    })

    return booking
  }

  async getClientBookings(clientId: string, status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: { clientId, ...(status ? { status } : {}) },
      orderBy: { scheduledAt: 'desc' },
      include: {
        services: { include: { service: { select: { name: true } } } },
        barber: { include: { user: { select: { firstName: true, lastName: true } } } },
        barbershop: { select: { name: true, address: true, coverImageUrl: true } },
        payment: { select: { status: true, paidAt: true } },
      },
    })
  }

  async getBarbershopBookings(barbershopId: string, ownerId: string, date?: string) {
    const barbershop = await this.prisma.barbershop.findUnique({ where: { id: barbershopId } })
    if (!barbershop || barbershop.ownerId !== ownerId) throw new ForbiddenException('Sin permisos')

    const where: any = { barbershopId }
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.scheduledAt = { gte: startOfDay, lte: endOfDay }
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        services: { include: { service: { select: { name: true } } } },
        client: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } },
        barber: { include: { user: { select: { firstName: true, lastName: true } } } },
        payment: { select: { status: true } },
      },
    })
  }

  async updateStatus(id: string, userId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { barbershop: true },
    })
    if (!booking) throw new NotFoundException('Reserva no encontrada')

    const isOwner = booking.barbershop.ownerId === userId
    const isClient = booking.clientId === userId

    // Solo el cliente puede cancelar su propia reserva pendiente
    if (status === 'CANCELLED' && !isClient && !isOwner) {
      throw new ForbiddenException('Sin permisos para cancelar')
    }
    // Solo la barbería puede confirmar/completar
    if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'].includes(status) && !isOwner) {
      throw new ForbiddenException('Solo la barbería puede cambiar este estado')
    }

    return this.prisma.booking.update({ where: { id }, data: { status } })
  }

  async getBookingById(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        barber: { include: { user: { select: { firstName: true, lastName: true } } } },
        barbershop: { select: { id: true, name: true, address: true, phone: true } },
        client: { select: { firstName: true, lastName: true, phone: true } },
        payment: true,
      },
    })

    if (!booking) throw new NotFoundException('Reserva no encontrada')
    if (booking.clientId !== userId && booking.barbershop.id !== userId) {
      throw new ForbiddenException('Sin permisos')
    }

    return booking
  }
}
