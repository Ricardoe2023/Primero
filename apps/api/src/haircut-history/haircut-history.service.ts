import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

export interface CreateHaircutRecordDto {
  clientId: string
  barbershopId: string
  bookingId?: string
  serviceNames: string[]
  notes?: string
}

@Injectable()
export class HaircutHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecord(barberId: string, dto: CreateHaircutRecordDto) {
    // Verificar que el barbero pertenece a la barbería
    const barber = await this.prisma.barber.findFirst({
      where: { userId: barberId, barbershopId: dto.barbershopId },
    })
    const owner = await this.prisma.barbershop.findFirst({
      where: { id: dto.barbershopId, ownerId: barberId },
    })
    if (!barber && !owner) throw new ForbiddenException('Sin permisos para registrar cortes aquí')

    return this.prisma.haircutRecord.create({
      data: {
        clientId: dto.clientId,
        barbershopId: dto.barbershopId,
        barberId: barber?.id ?? (await this.prisma.barber.findFirst({ where: { userId: barberId } }))!.id,
        bookingId: dto.bookingId,
        serviceNames: dto.serviceNames,
        notes: dto.notes,
      },
    })
  }

  async addPhoto(recordId: string, userId: string, photoUrl: string, caption?: string) {
    const record = await this.prisma.haircutRecord.findUnique({
      where: { id: recordId },
      include: { barbershop: true },
    })
    if (!record) throw new NotFoundException('Registro no encontrado')

    const isOwner = record.barbershop.ownerId === userId
    const isBarber = await this.prisma.barber.findFirst({
      where: { userId, barbershopId: record.barbershopId },
    })
    if (!isOwner && !isBarber) throw new ForbiddenException('Sin permisos para subir fotos')

    return this.prisma.haircutPhoto.create({
      data: { haircutRecordId: recordId, url: photoUrl, caption },
    })
  }

  async getClientHistory(clientId: string, requesterId: string) {
    // El cliente ve su propio historial; la barbería ve solo lo que hizo ella
    const isOwner = clientId === requesterId
    const barber = await this.prisma.barber.findFirst({ where: { userId: requesterId } })
    const barbershopOwner = await this.prisma.barbershop.findFirst({ where: { ownerId: requesterId } })

    const where: any = { clientId }
    if (!isOwner) {
      if (barber) where.barberId = barber.id
      else if (barbershopOwner) where.barbershopId = barbershopOwner.id
      else throw new ForbiddenException('Sin permisos')
    }

    return this.prisma.haircutRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      include: {
        photos: true,
        barber: { include: { user: { select: { firstName: true, lastName: true } } } },
        barbershop: { select: { name: true } },
      },
    })
  }

  async deletePhoto(photoId: string, userId: string) {
    const photo = await this.prisma.haircutPhoto.findUnique({
      where: { id: photoId },
      include: { haircutRecord: { include: { barbershop: true } } },
    })
    if (!photo) throw new NotFoundException('Foto no encontrada')

    const isOwner = photo.haircutRecord.barbershop.ownerId === userId
    if (!isOwner) throw new ForbiddenException('Sin permisos')

    return this.prisma.haircutPhoto.delete({ where: { id: photoId } })
  }
}
