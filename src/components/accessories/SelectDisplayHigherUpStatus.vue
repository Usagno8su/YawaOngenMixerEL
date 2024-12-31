<script setup lang="ts">
const props = defineProps<{
  settype: dataTextType
  higherUpType: dataTextType
  actStatus: boolean
  onClick: () => void
}>()

// 選択中のキャラ設定で、その項目を有効にするか選択するボタン
// ONのときはそのキャラ設定タイプ
// OFFのときはどの上位設定が使われているか色で表示する。

import type { dataTextType } from '@/type/data-type'
import { typeColor } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'
</script>

<template>
  <div v-if="settype !== 'defo'" class="flex w-14 justify-end border-l-[1px] border-gray-400" title="ここの設定を使用">
    <button
      @click="onClick()"
      :class="
        MakeClassString(
          'w-10 rounded-full border px-1 font-medium hover:bg-gray-600 hover:text-gray-100',
          actStatus
            ? typeColor[props.settype].bg + ' ' + 'border-gray-800'
            : typeColor[props.higherUpType].bg + ' ' + 'border-gray-500 text-gray-500',
        )
      "
      :title="actStatus ? 'この設定を使用' : '上位設定を使用'"
    >
      {{ actStatus ? 'ON' : 'OFF' }}
    </button>
  </div>
</template>
