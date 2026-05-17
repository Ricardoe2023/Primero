export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentProvider = 'MERCADO_PAGO' | 'FLOW' | 'TRANSBANK'

export interface PaymentSummary {
  id: string
  bookingId: string
  amount: number
  provider: PaymentProvider
  status: PaymentStatus
  paidAt?: string
}
