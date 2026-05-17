import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '@prisma/client'

export class SyncUserDto {
  @IsString()
  id: string

  @IsEmail()
  email: string

  @IsEnum(UserRole)
  role: UserRole

  @IsString()
  @MinLength(1)
  firstName: string

  @IsString()
  @MinLength(1)
  lastName: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string
}
