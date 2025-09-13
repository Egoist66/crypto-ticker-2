import type { Coins, Props } from '@/types/crypto.types'
import { ref, computed, watch, onUnmounted } from 'vue'
import cryptoConfig from '../config/api.config.json'
import type { CryptoResponse, Data } from '@/types/crypto-api.types'
import { useQuery } from '@tanstack/vue-query'

export const useCryptoTracker = ({
  coin,
  showChange,
  showIcon,
  refreshInterval,
  currency,
  isSelector,
}: Props) => {
  const selectedCoin = ref<Coins>(coin || 'bitcoin')
  const lastUpdated = ref<Date | null>(null)
  const isAllReportVisible = ref<boolean>(false)

  const toggleAllReport = () => {
    isAllReportVisible.value = !isAllReportVisible.value
  }

  const fetchPrice = async (): Promise<CryptoResponse<Data>> => {
    const response = await fetch(`${cryptoConfig.currentCryptoUrl}${selectedCoin.value}`, {
      headers: {
        'X-WP-Nonce': cryptoConfig.nonce,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    lastUpdated.value = new Date()
    return response.json()
  }

  const fetchAllCryptosPrice = async (): Promise<CryptoResponse<Data[]>> => {
    const response = await fetch(`${cryptoConfig.allCryptosUrl}`, {
      headers: {
        'X-WP-Nonce': cryptoConfig.nonce,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    lastUpdated.value = new Date()
    return response.json()
  }

  const {
    isPending,
    isError,
    isLoading,
    isRefetching,
    dataUpdatedAt,
    status,
    data,
    error,
    refetch,
  } = useQuery<CryptoResponse<Data>>({
    queryKey: ['cryptos', selectedCoin.value],
    networkMode: 'online',
    retry: 3,
    refetchOnMount: true,
    refetchInterval: refreshInterval! * 1000,
    queryFn: fetchPrice,
  })

  const { data: allReportData, refetch: refetchAllCryptos } = useQuery<CryptoResponse<Data[]>>({
    queryKey: ['all-cryptos'],
    networkMode: 'online',
    retry: 3,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchInterval: refreshInterval! * 1000,
    queryFn: fetchAllCryptosPrice,
  })

  const formattedPrice = computed(() => {
    if (!data.value?.data.price) return 'Loading...'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(data.value?.data.price)
  })

  const formattedChange = computed(() => {
    return data.value?.data.priceChange
      ? `${data.value?.data.priceChange > 0 ? '+' : ''}${data.value?.data.priceChange.toFixed(2)}%`
      : '0%'
  })

  const changeClass = computed(() => ({
    'change-positive': data.value?.data?.priceChange ? data.value.data.priceChange > 0 : false,
    'change-negative': data.value?.data?.priceChange ? data.value.data.priceChange < 0 : false,
    'change-neutral': data.value?.data?.priceChange ? data.value.data.priceChange === 0 : false,
  }))

  const formattedTime = computed(() => {
    return dataUpdatedAt.value
      ? `Updated: ${new Date(dataUpdatedAt.value).toLocaleTimeString()}`
      : ''
  })

  watch(selectedCoin, async () => {
    refetch()
  })

  watch(isAllReportVisible, () => {
    refetchAllCryptos()
  })

  onUnmounted(() => {
    refetch({ cancelRefetch: true })
  })

  return {
    fetchPrice,
    refetch,
    toggleAllReport,
    formattedPrice,
    formattedChange,
    changeClass,
    formattedTime,
    selectedCoin,
    showChange,
    showIcon,
    isSelector,
    data,
    error,
    isError,
    isLoading,
    isRefetching,
    isPending,
    dataUpdatedAt,
    status,
    isAllReportVisible,
    allReportData,
  }
}
