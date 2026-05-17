import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { CreateBarbershopDto, UpdateBarbershopDto } from './dto/create-barbershop.dto'

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  )
}

@Injectable()
export class BarbershopsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { city?: string; search?: string; page?: number; limit?: number }) {
    const { city, search, page = 1, limit = 12 } = query
    const skip = (page - 1) * limit

    const where: any = { status: 'ACTIVE' }
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [items, total] = await Promise.all([
      this.prisma.barbershop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          city: true,
          coverImageUrl: true,
          rating: true,
          reviewCount: true,
          services: { where: { isActive: true }, select: { price: true }, take: 1, orderBy: { price: 'asc' } },
        },
      }),
      this.prisma.barbershop.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findBySlug(slug: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        services: { where: { isActive: true } },
        schedules: true,
        galleryImages: { orderBy: { order: 'asc' } },
        barbers: {
          where: { isActive: true },
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { client: { select: { firstName: true, avatarUrl: true } } },
        },
      },
    })

    if (!barbershop) throw new NotFoundException('Barbería no encontrada')
    return barbershop
  }

  async create(ownerId: string, dto: CreateBarbershopDto) {
    const existing = await this.prisma.barbershop.findUnique({ where: { ownerId } })
    if (existing) throw new ConflictException('Ya tienes una barbería registrada')

    const slug = generateSlug(dto.name)

    return this.prisma.barbershop.create({
      data: { ...dto, ownerId, slug },
    })
  }

  async update(id: string, ownerId: string, dto: UpdateBarbershopDto) {
    const barbershop = await this.prisma.barbershop.findUnique({ where: { id } })
    if (!barbershop) throw new NotFoundException('Barbería no encontrada')
    if (barbershop.ownerId !== ownerId) throw new ForbiddenException('Sin permisos')

    return this.prisma.barbershop.update({ where: { id }, data: dto })
  }

  async getMyBarbershop(ownerId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { ownerId },
      include: {
        services: true,
        schedules: true,
        barbers: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    })
    if (!barbershop) throw new NotFoundException('No tienes una barbería')
    return barbershop
  }

  async getAvailability(barbershopId: string, date: string, barberId?: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { schedules: true, services: { where: { isActive: true } } },
    })
    if (!barbershop) throw new NotFoundException('Barbería no encontrada')

    const targetDate = new Date(date)
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayOfWeek = dayNames[targetDate.getDay()]

    const schedule = barbershop.schedules.find((s) => s.dayOfWeek === dayOfWeek)
    if (!schedule || !schedule.isOpen) return { slots: [], message: 'Cerrado ese día' }

    // Buscar reservas existentes para ese día
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const bookedSlots = await this.prisma.booking.findMany({
      where: {
        barbershopId,
        ...(barberId ? { barberId } : {}),
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: { scheduledAt: true, endsAt: true },
    })

    // Generar slots de 30 minutos
    const slots = this.generateSlots(schedule.openTime, schedule.closeTime, bookedSlots, targetDate)

    return { date, dayOfWeek, slots }
  }

  private generateSlots(
    openTime: string,
    closeTime: string,
    booked: { scheduledAt: Date; endsAt: Date }[],
    date: Date,
  ) {
    const slots: { time: string; available: boolean }[] = []
    const [openH, openM] = openTime.split(':').map(Number)
    const [closeH, closeM] = closeTime.split(':').map(Number)

    let current = new Date(date)
    current.setHours(openH, openM, 0, 0)
    const close = new Date(date)
    close.setHours(closeH, closeM, 0, 0)

    while (current < close) {
      const slotEnd = new Date(current.getTime() + 30 * 60 * 1000)
      const isBooked = booked.some(
        (b) => current < new Date(b.endsAt) && slotEnd > new Date(b.scheduledAt),
      )

      slots.push({
        time: current.toTimeString().substring(0, 5),
        available: !isBooked,
      })
      current = slotEnd
    }

    return slots
  }
}
