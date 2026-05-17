export type BarbershopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'

export interface BarbershopPublic {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  coverImageUrl?: string
  status: BarbershopStatus
  rating: number
  reviewCount: number
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
  durationMin: number
  imageUrl?: string
  isActive: boolean
}
