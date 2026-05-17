import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator'

export class CreateBookingDto {
  @IsString()
  barbershopId: string

  @IsString()
  barberId: string

  @IsArray()
  @IsString({ each: true })
  serviceIds: string[]

  @IsDateString()
  scheduledAt: string

  @IsOptional()
  @IsString()
  notes?: string
}
