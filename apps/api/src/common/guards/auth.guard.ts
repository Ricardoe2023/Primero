import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from '../../database/prisma.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) throw new UnauthorizedException('Token requerido')

    const jwtSecret = this.config.get<string>('supabase.jwtSecret')
    if (!jwtSecret) throw new UnauthorizedException('Auth no configurado')

    let payload: jwt.JwtPayload
    try {
      payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }

    const userId = payload.sub
    if (!userId) throw new UnauthorizedException('Token sin usuario')

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) throw new UnauthorizedException('Usuario no encontrado o inactivo')

    request.user = user
    return true
  }

  private extractToken(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
