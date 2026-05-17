import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateBarbershopDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsString()
  @MinLength(2)
  address: string

  @IsString()
  city: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number
}

export class UpdateBarbershopDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsString()
  coverImageUrl?: string
}
