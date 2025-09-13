export interface Props {
  coin?: Coins
  showChange?: boolean
  refreshInterval?: number
  showIcon?: boolean
  currency?: string
  isSelector?: boolean
}

export type Coins = 'bitcoin' | 'ethereum' | 'solana' | 'dogecoin' | 'binancecoin' | 'cardano'
