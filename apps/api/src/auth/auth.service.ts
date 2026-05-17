import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { SyncUserDto, UpdateProfileDto } from './dto/sync-user.dto'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(dto: SyncUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: dto.id } })

    if (existing) {
      return this.prisma.user.update({
        where: { id: dto.id },
        data: { email: dto.email, role: dto.role },
      })
    }

    const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (emailTaken) throw new ConflictException('Email ya registrado')

    return this.prisma.user.create({
      data: {
        id: dto.id,
        email: dto.email,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    })
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: { select: { id: true, barbershopId: true } },
        ownedBarbershop: { select: { id: true, slug: true, name: true, status: true } },
      },
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })
  }
}
