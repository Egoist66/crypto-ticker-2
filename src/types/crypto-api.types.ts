export interface CryptoResponse {
  success: boolean
  data: Data
}

export interface Data {
  id: string
  name: string
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  lastUpdated: string
}
