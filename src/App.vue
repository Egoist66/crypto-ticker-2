<script setup lang="ts">
import CryptoTracker from './components/CryptoTracker.vue'
</script>

<template>
  <CryptoTracker is-selector :refresh-interval="70" />
</template>

<style scoped></style>
