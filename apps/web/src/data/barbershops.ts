export interface StaticService {
  id: string
  name: string
  price: number
  duration: number
  description?: string
}

export interface StaticBarbershop {
  id: string
  name: string
  slug: string
  address: string
  neighborhood: string
  city: string
  rating: number
  reviewCount: number
  phone?: string
  description: string
  specialty: string
  services: StaticService[]
  coverImageUrl?: string
}

export const BARBERSHOPS: StaticBarbershop[] = [
  {
    id: '1',
    name: 'Routine BarberStudio',
    slug: 'routine-barberstudio',
    address: 'Huérfanos 1044, Of. 45',
    neighborhood: 'Santiago Centro',
    city: 'Santiago',
    rating: 4.9,
    reviewCount: 255,
    phone: '',
    description: 'Espacio integral donde la experiencia y calidad ofrecen atención única y personalizada. Profesionales altamente capacitados en barbería clásica y cosmetología masculina.',
    specialty: 'Barbería clásica, cosmetología, perfilado de barba',
    services: [
      { id: 's1', name: 'Corte de cabello', price: 12000, duration: 30 },
      { id: 's2', name: 'Corte + barba', price: 18000, duration: 50 },
      { id: 's3', name: 'Perfilado de barba', price: 9000, duration: 25 },
      { id: 's4', name: 'Consulta exprés', price: 0, duration: 15 },
    ],
  },
  {
    id: '2',
    name: 'Barbería Le Varón',
    slug: 'barberia-le-varon',
    address: 'Nataniel Cox 114',
    neighborhood: 'Santiago Centro',
    city: 'Santiago',
    rating: 5.0,
    reviewCount: 43,
    phone: '',
    description: 'Barbería de origen venezolano dedicada al cuidado estético y personal. Espacio para hombres y niños con barberos muy profesionales y dedicados. Excelente ambiente.',
    specialty: 'Cortes profesionales, cuidado de barba, barbería clásica',
    services: [
      { id: 's1', name: 'Corte de cabello', price: 10000, duration: 30 },
      { id: 's2', name: 'Corte infantil', price: 8000, duration: 25 },
      { id: 's3', name: 'Corte + barba', price: 16000, duration: 50 },
      { id: 's4', name: 'Afeitado navaja', price: 12000, duration: 40 },
    ],
  },
  {
    id: '3',
    name: 'Alta Barber',
    slug: 'alta-barber',
    address: 'Calle Nueva 120, Local 1',
    neighborhood: 'La Florida',
    city: 'Santiago',
    rating: 4.9,
    reviewCount: 52,
    phone: '+56 9 4676 2930',
    description: 'Salón inspirado en las tendencias de Melbourne, Australia. Espacio impecable, limpio y ordenado con excelente atención. Estacionamiento disponible, equipo amable.',
    specialty: 'Cortes de calidad, styling moderno, masajes',
    services: [
      { id: 's1', name: 'Corte clásico', price: 11000, duration: 30 },
      { id: 's2', name: 'Fade + barba', price: 19000, duration: 55 },
      { id: 's3', name: 'Masaje capilar', price: 8000, duration: 20 },
      { id: 's4', name: 'Corte + masaje', price: 17000, duration: 45 },
    ],
  },
  {
    id: '4',
    name: 'The Cave Barber',
    slug: 'the-cave-barber',
    address: 'Pedro Torres 384, Local 5',
    neighborhood: 'Ñuñoa',
    city: 'Santiago',
    rating: 4.8,
    reviewCount: 118,
    phone: '+56 9 8307 7050',
    description: '6 años de experiencia en barbería. Experiencia completa y única con bebidas de cortesía y silla de masajes. Limpio, ordenado y con altos estándares de higiene.',
    specialty: 'Low Fade, cortes con tijera, cortes texturizados, grooming masculino',
    services: [
      { id: 's1', name: 'Low Fade', price: 13000, duration: 35 },
      { id: 's2', name: 'Corte con tijera', price: 14000, duration: 40 },
      { id: 's3', name: 'Corte texturizado', price: 13000, duration: 35 },
      { id: 's4', name: 'Full experience (corte + barba + masaje)', price: 22000, duration: 70 },
    ],
  },
  {
    id: '5',
    name: 'Barbudos Barbería',
    slug: 'barbudos-barberia',
    address: 'Av. Nueva Providencia 2260',
    neighborhood: 'Providencia',
    city: 'Santiago',
    rating: 4.8,
    reviewCount: 187,
    phone: '+56 9 3062 4045',
    description: 'Joya del grooming en Providencia. Ambiente acogedor donde los barberos priorizan la comodidad y satisfacción del cliente. Ofrece bebidas mientras esperás. Atención al detalle excepcional.',
    specialty: 'Barbería clásica, corte de barba con toalla caliente, tónicos',
    services: [
      { id: 's1', name: 'Corte clásico', price: 12000, duration: 30 },
      { id: 's2', name: 'Afeitado con toalla caliente', price: 15000, duration: 45 },
      { id: 's3', name: 'Corte + barba premium', price: 22000, duration: 60 },
      { id: 's4', name: 'Tratamiento tónico capilar', price: 10000, duration: 30 },
    ],
  },
  {
    id: '6',
    name: 'Club de la Barba',
    slug: 'club-de-la-barba',
    address: 'Santo Domingo 648',
    neighborhood: 'Bellas Artes',
    city: 'Santiago',
    rating: 4.7,
    reviewCount: 412,
    phone: '+56 9 7206 3315',
    description: 'Cadena que revoluciona el mercado barber con 3 locales, 40+ profesionales y más de 40.000 clientes anuales. Reserva online, apps móviles y programa de beneficios.',
    specialty: 'Barbería moderna, herramienta de análisis facial, reserva online',
    services: [
      { id: 's1', name: 'Corte clásico', price: 11000, duration: 30 },
      { id: 's2', name: 'Corte + barba', price: 17000, duration: 50 },
      { id: 's3', name: 'Análisis facial + corte', price: 15000, duration: 40 },
      { id: 's4', name: 'Membresía mensual', price: 35000, duration: 0 },
    ],
  },
  {
    id: '7',
    name: 'Vikingos Barber',
    slug: 'vikingos-barber',
    address: 'José Victorino Lastarria 202',
    neighborhood: 'Barrio Lastarria',
    city: 'Santiago',
    rating: 4.7,
    reviewCount: 210,
    phone: '',
    description: 'Primera barbería del Barrio Lastarria. Ambiente agradable con buena música y excelente atención. 94% de recomendación. Experiencia relajante y profesional.',
    specialty: 'Cortes, perfilado de barba, limpieza facial, podología',
    services: [
      { id: 's1', name: 'Corte de cabello', price: 12000, duration: 30 },
      { id: 's2', name: 'Perfilado de barba (hot pack)', price: 11000, duration: 35 },
      { id: 's3', name: 'Limpieza facial', price: 14000, duration: 40 },
      { id: 's4', name: 'Corte completo + limpieza', price: 22000, duration: 65 },
    ],
  },
  {
    id: '8',
    name: 'Ministry la Barbería',
    slug: 'ministry-la-barberia',
    address: 'Moneda 973, Local 330',
    neighborhood: 'Santiago Centro',
    city: 'Santiago',
    rating: 4.6,
    reviewCount: 203,
    phone: '+56 9 6161 4170',
    description: 'Una de las primeras de la nueva generación (desde 2012). Ofrece el mejor asesoramiento, servicio y calidad. Ambiente moderno con cortes y afeitados de alta calidad.',
    specialty: 'Cortes, limpieza facial, mantenimiento de barba, reparación de manos',
    services: [
      { id: 's1', name: 'Corte de cabello', price: 15000, duration: 35 },
      { id: 's2', name: 'Afeitado clásico', price: 16000, duration: 40 },
      { id: 's3', name: 'Limpieza facial masculina', price: 18000, duration: 50 },
      { id: 's4', name: 'Tratamiento de manos', price: 12000, duration: 30 },
    ],
  },
  {
    id: '9',
    name: 'André Barbershop',
    slug: 'andre-barbershop',
    address: 'Vitacura 7144, Local 30',
    neighborhood: 'Vitacura',
    city: 'Santiago',
    rating: 4.6,
    reviewCount: 89,
    phone: '+56 9 3126 5701',
    description: 'Barbería profesional con equipo experimentado. Fundada por Thomas con barberos de más de 10 años de experiencia. Reconocida por cortes muy buenos y servicio de calidad.',
    specialty: 'Cortes de calidad, servicio profesional, equipo experimentado',
    services: [
      { id: 's1', name: 'Corte clásico', price: 16000, duration: 35 },
      { id: 's2', name: 'Corte + barba', price: 24000, duration: 55 },
      { id: 's3', name: 'Fade premium', price: 18000, duration: 40 },
      { id: 's4', name: 'Servicio VIP', price: 35000, duration: 80 },
    ],
  },
  {
    id: '10',
    name: 'Nelobarberstudio',
    slug: 'nelobarberstudio',
    address: 'Morandé 835, Of. 1303',
    neighborhood: 'Santiago Centro',
    city: 'Santiago',
    rating: 4.9,
    reviewCount: 76,
    phone: '+56 9 4562 2496',
    description: 'Barbería moderna en el corazón de Santiago. Referente de servicio de calidad en cortes y estilos para hombres. Equipo profesional que combina técnica y creatividad.',
    specialty: 'Cortes modernos, estilos, barbería creativa',
    services: [
      { id: 's1', name: 'Corte moderno', price: 13000, duration: 35 },
      { id: 's2', name: 'Diseño personalizado', price: 16000, duration: 45 },
      { id: 's3', name: 'Corte + barba creativa', price: 21000, duration: 60 },
      { id: 's4', name: 'Color + corte', price: 28000, duration: 80 },
    ],
  },
  {
    id: '11',
    name: 'Suecia Barbershop',
    slug: 'suecia-barbershop',
    address: 'Manuel Montt 2792 (esq. Irarrázaval)',
    neighborhood: 'Ñuñoa',
    city: 'Santiago',
    rating: 4.5,
    reviewCount: 222,
    phone: '+56 9 5414 9319',
    description: 'Barbería exclusivamente masculina con concepto simple, moderno y acogedor. Barberos profesionales y experimentados con técnicas individuales.',
    specialty: 'Barbería moderna, grooming masculino, servicio profesional',
    services: [
      { id: 's1', name: 'Corte clásico', price: 10000, duration: 30 },
      { id: 's2', name: 'Corte + barba', price: 15000, duration: 45 },
      { id: 's3', name: 'Fade', price: 12000, duration: 35 },
      { id: 's4', name: 'Corte infantil', price: 8000, duration: 25 },
    ],
  },
  {
    id: '12',
    name: 'Club de la Barba Providencia',
    slug: 'club-de-la-barba-providencia',
    address: 'Antonio Varas 394',
    neighborhood: 'Providencia',
    city: 'Santiago',
    rating: 4.7,
    reviewCount: 334,
    phone: '+56 9 7206 3315',
    description: 'Sucursal Providencia de la cadena líder. Sistema de reserva online y app móvil disponible. Herramienta de análisis facial para consulta de corte. Atención fines de semana.',
    specialty: 'Barbería profesional, servicios modernos, reserva online',
    services: [
      { id: 's1', name: 'Corte clásico', price: 11000, duration: 30 },
      { id: 's2', name: 'Corte + barba', price: 17000, duration: 50 },
      { id: 's3', name: 'Análisis facial + corte', price: 15000, duration: 40 },
      { id: 's4', name: 'Membresía mensual', price: 35000, duration: 0 },
    ],
  },
]

export const CITIES = [...new Set(BARBERSHOPS.map((b) => b.city))]
export const NEIGHBORHOODS = [...new Set(BARBERSHOPS.map((b) => b.neighborhood))]
