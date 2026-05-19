import { Body, Controller, Get, Patch, Post } from '@nestjs/common'
import { User } from '../generated/prisma'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { SyncUserDto, UpdateProfileDto } from './dto/sync-user.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Llamado desde el frontend justo después del registro en Supabase
  @Public()
  @Post('sync-user')
  syncUser(@Body() dto: SyncUserDto) {
    return this.authService.syncUser(dto)
  }

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id)
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto)
  }
}
