export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  industry: string
  created_at: string
}

export interface Location {
  id: string
  business_id: string
  name: string
  address: string
  city: string
  neighborhood: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  hours: Record<string, { open: string; close: string }>
  is_active: boolean
  created_at: string
}

export interface ServiceCategory {
  id: string
  business_id: string
  name: string
  sort_order: number
}

export interface Service {
  id: string
  business_id: string
  location_id: string | null
  category_id: string | null
  name: string
  description: string | null
  price: number
  duration_minutes: number
  staff_ids: string[]
  is_active: boolean
  created_at: string
}

export interface ProductCategory {
  id: string
  business_id: string
  name: string
  sort_order: number
}

export interface Product {
  id: string
  business_id: string
  category_id: string | null
  name: string
  description: string | null
  brand: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Staff {
  id: string
  business_id: string
  location_id: string | null
  name: string
  role: string | null
  bio: string | null
  avatar_url: string | null
  specialties: string[]
  is_active: boolean
  created_at: string
}

export interface StaffAvailability {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface AgentConfig {
  id: string
  business_id: string
  agent_name: string
  greeting: string | null
  personality: string
  language: string
  extra_instructions: string | null
  whatsapp_number: string | null
  instagram_handle: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  location_id: string | null
  staff_id: string | null
  service_id: string | null
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes: string | null
  source: 'agent' | 'manual' | 'web'
  created_at: string
}

export interface BusinessContext {
  business: Business
  locations: Location[]
  services: Service[]
  products: Product[]
  staff: Staff[]
  agentConfig: AgentConfig | null
}
