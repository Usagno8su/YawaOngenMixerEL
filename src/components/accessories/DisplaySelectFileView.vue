<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  selectKyara: number
}>()
import type { outSettingType } from '@/type/data-type'
</script>

<template>
  <div class="flex items-center font-bold">
    <div class="mr-1 border-r-[1px] border-gray-400 pr-1 font-normal text-gray-600">設定範囲</div>
    <div v-if="dateList[selectKyara].dataType === 'defo'" class="font-bold text-red-500">全体デフォルト設定</div>
    <div v-else-if="dateList[selectKyara].dataType === 'seid'" class="font-bold text-red-600">
      {{ dateList[selectKyara].fileName }}
    </div>
    <div v-else class="flex items-center">
      <div class="text-gray-400">●●●_</div>
      <div class="font-bold text-red-600">
        {{ dateList[selectKyara].name }}
      </div>
      <div class="font-bold text-red-600">
        {{ dateList[selectKyara].dataType === 'kyast' ? '（' + dateList[selectKyara].kyaraStyle + '）' : null }}
      </div>
      <div class="text-gray-400">_●●●</div>
    </div>
  </div>
</template>
