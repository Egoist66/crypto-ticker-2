export interface CryptoResponse<T> {
  success: boolean
  data: T
}

export interface Data {
  id: string
  name: string
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  lastUpdated: string
  icon: string
  fullName: string
}
