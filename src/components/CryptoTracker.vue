<script setup lang="ts">
import { useCryptoTracker } from '@/composables/useCryptoTracker'
import type { Props } from '@/types/crypto.types'

const {
  showChange = true,
  refreshInterval = 3,
  showIcon = true,
  currency = 'USD',
  isSelector = false,
} = defineProps<Props>()

const {
  changeClass,
  coinIcon,
  coinName,
  error,
  formattedPrice,
  formattedChange,
  formattedTime,
  isLoading,
  selectedCoin,
  refreshIntervalValue,
} = useCryptoTracker({
  showChange,
  refreshInterval,
  showIcon,
  currency,
})
</script>

<template>
  <div class="crypto-price-container" :class="{ loading: isLoading, error: !!error }">
    <!-- Селектор криптовалют -->
    <div v-if="isSelector" class="crypto-selector">
      <label for="crypto-select">Выберите криптовалюту:</label>
      <select id="crypto-select" v-model="selectedCoin">
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="solana">Solana (SOL)</option>
      </select>
    </div>

    <div v-if="refreshInterval" class="crypto-refresh crypto-selector">
      <label for="crypto-refresh-select">Обновлять каждые:</label>
      <select class="select" id="crypto-refresh-select" v-model="refreshIntervalValue">
        <option value="1">1 секунду</option>
        <option value="5">5 секунд</option>
        <option value="10">10 секунд</option>
        <option value="70">70 секунд</option>
      </select>

      <div v-if="isLoading" class="crypto-loading">
        <p>Загрузка данных для {{ coinName }}...</p>
      </div>

      <!-- Состояние ошибки -->
      <div v-if="error && !isLoading" class="crypto-error">
        <p>Ошибка: {{ error }}</p>
      </div>

      <!-- Отображение данных -->
      <div v-if="!isLoading && !error" class="crypto-content">
        <div v-if="showIcon" class="crypto-icon">
          <img :src="coinIcon" :alt="selectedCoin" width="32" height="32" />
        </div>

        <div class="crypto-info">
          <h3 class="crypto-name">{{ coinName }}</h3>
          <p class="crypto-price">{{ formattedPrice }}</p>

          <p v-if="showChange" class="crypto-change" :class="changeClass">
            {{ formattedChange }}
          </p>

          <small class="crypto-updated">{{ formattedTime }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crypto-price-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  margin: 15px 0;
}

.crypto-selector {
  margin-bottom: 10px;
}

.crypto-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.crypto-selector select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

.crypto-selector select.refresh-select:focus {
  outline: none;
  border-color: #007cba;
  outline: none;
  border-color: #007cba;
}

.crypto-content {
  padding-top: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.crypto-icon img {
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crypto-info {
  flex: 1;
}

.crypto-name {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.crypto-price {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.crypto-change {
  margin: 0 5px 8px 0;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.change-positive {
  background-color: #d4edda;
  color: #155724;
}

.change-negative {
  background-color: #f8d7da;
  color: #721c24;
}

.change-neutral {
  background-color: #e2e3e5;
  color: #383d41;
}

.crypto-updated {
  color: #6c757d;
  font-size: 12px;
}

.crypto-loading {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.crypto-error {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}
</style>
