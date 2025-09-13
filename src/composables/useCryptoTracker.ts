import type { Coins, Props } from '@/types/crypto.types'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import cryptoData from '../config/api.config.json'
import type { CryptoResponse } from '@/types/crypto-api.types'

export const useCryptoTracker = ({ coin, showChange, showIcon, currency, isSelector }: Props) => {
  const refreshIntervalValue = ref<number>(70)
  const selectedCoin = ref<Coins>(coin || 'bitcoin')
  const price = ref<number>(0)
  const change = ref<number>(0)
  const isLoading = ref<boolean>(true)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const refreshIntervalId = ref<number | null>(null)

  const coinName = computed(() => {
    const names: Record<string, string> = {
      bitcoin: 'Bitcoin (BTC)',
      ethereum: 'Ethereum (ETH)',
      solana: 'Solana (SOL)',
    }
    return names[selectedCoin.value!] || 'Crypto'
  })

  const formattedPrice = computed(() => {
    if (!price.value) return 'Loading...'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price.value)
  })

  const formattedChange = computed(() => {
    return change.value ? `${change.value > 0 ? '+' : ''}${change.value.toFixed(2)}%` : '0%'
  })

  const changeClass = computed(() => ({
    'change-positive': change.value > 0,
    'change-negative': change.value < 0,
    'change-neutral': change.value === 0,
  }))

  const formattedTime = computed(() => {
    return lastUpdated.value ? `Updated: ${lastUpdated.value.toLocaleTimeString()}` : ''
  })

  const coinIcon = computed(() => {
    const icons: Record<string, string> = {
      bitcoin: 'https://img.icons8.com/color/48/bitcoin',
      ethereum: 'https://img.icons8.com/3d-fluency/94/ethereum.png',
      solana: 'https://img.icons8.com/nolan/64/solana.png',
    }
    return icons[selectedCoin.value!] || 'https://img.icons8.com/3d-fluency/94/coin.png'
  })

  const fetchPrice = async (coin: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(`${cryptoData.baseURL}${coin}`, {
        headers: {
          'X-WP-Nonce': cryptoData.nonce,
          Accept: 'application/json',
        },
      })

      const data: CryptoResponse = await response.json()

      if (data.success) {
        price.value = data.data.price
        change.value = data.data.priceChange
        lastUpdated.value = new Date()
      } else {
        error.value = 'Failed to fetch data'
      }
    } catch (err) {
      error.value = 'Network error'
      console.error('Error fetching crypto price:', err)
    } finally {
      isLoading.value = false
    }
  }

  const startAutoRefresh = () => {
    stopAutoRefresh()

    if (refreshIntervalValue.value! > 0) {
      refreshIntervalId.value = window.setInterval(async () => {
        await fetchPrice(selectedCoin.value)
      }, refreshIntervalValue.value! * 1000)
    }
  }

  const stopAutoRefresh = () => {
    if (refreshIntervalId.value !== null) {
      clearInterval(refreshIntervalId.value)
      refreshIntervalId.value = null
    }
  }

  onMounted(async () => {
    await fetchPrice(selectedCoin.value)
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  watch(selectedCoin, async () => {
    stopAutoRefresh()
    await fetchPrice(selectedCoin.value)
  })

  return {
    coinName,
    formattedPrice,
    formattedChange,
    changeClass,
    formattedTime,
    coinIcon,
    isLoading,
    error,
    selectedCoin,
    showChange,
    showIcon,
    fetchPrice,
    refreshIntervalValue,
    isSelector,
  }
}
