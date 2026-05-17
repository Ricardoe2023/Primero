export type UserRole = 'CLIENT' | 'BARBER' | 'BARBERSHOP_OWNER' | 'ADMIN'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
}
