export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface BookingSummary {
  id: string
  barbershopId: string
  barbershopName: string
  barberId: string
  barberName: string
  scheduledAt: string
  endsAt: string
  status: BookingStatus
  totalAmount: number
  services: string[]
}
