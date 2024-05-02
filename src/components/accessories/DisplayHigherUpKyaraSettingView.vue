<script setup lang="ts">
const props = defineProps<{
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
}>()

import type { dataTextType, outSettingType, subtitleSettingType } from 'src/type/data-type'
import { typeColor } from '@/data/data'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'

// 色設定から必要なTailwind CSS を取り出して整形する
const setTypeColor = (stype: dataTextType): string => {
  return typeColor[stype].bg + ' ' + 'p-1 border rounded-full border-gray-700 truncate max-w-32 min-w-10'
}
</script>

<template>
  <div class="flex w-2/3 items-center justify-start">
    <div v-if="settype !== 'defo'">
      <div :class="setTypeColor('defo')">デフォルト</div>
    </div>
    <div v-if="dateList[higherUpList[1]].dataType === 'kyara'" class="flex items-center">
      <MaterialIcons classString="w-5" icon="ArrowForward400024" />
      <div :class="setTypeColor('kyara')" :title="dateList[higherUpList[1]].name">
        {{ dateList[higherUpList[1]].name }}
      </div>
    </div>
    <div v-if="dateList[higherUpList[0]].dataType === 'kyara'" class="flex items-center">
      <MaterialIcons classString="w-5" icon="ArrowForward400024" />
      <div :class="setTypeColor('kyara')" :title="dateList[higherUpList[0]].name">
        {{ dateList[higherUpList[0]].name }}
      </div>
    </div>
    <div v-if="dateList[higherUpList[0]].dataType === 'kyast'" class="flex items-center">
      <MaterialIcons classString="w-5" icon="ArrowForward400024" />
      <div :class="setTypeColor('kyast')" :title="dateList[higherUpList[0]].kyaraStyle">
        {{ dateList[higherUpList[0]].kyaraStyle }}
      </div>
    </div>
    <MaterialIcons classString="w-5" icon="ArrowForward400024" v-if="settype !== 'defo'" />
  </div>
</template>
