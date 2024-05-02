<script setup lang="ts">
const props = defineProps<{
  settype: dataTextType
  higherUpType: dataTextType
  actStatus: boolean
  onClick: () => void
}>()

// 選択中のキャラ設定で、その項目を有効にするか選択するボタン
// OFFのときはどの上位設定が使われているか色で表示する。

import type { dataTextType } from '@/type/data-type'
import { typeColor } from '@/data/data'

// ボタンの色を決める
// ONのときはそのキャラ設定タイプ
// OFFのときは使用する上位設定の色にする
const selectTypeColor = (): string => {
  return props.actStatus
    ? typeColor[props.settype].bg + ' ' + 'border-gray-800'
    : typeColor[props.higherUpType].bg + ' ' + 'text-gray-500 border-gray-500'
}

// 選択中の要素の場合は背景色を変更する
const actset = (): string => {
  return 'px-1 border rounded-full w-10 font-medium hover:bg-gray-600 hover:text-gray-100' + ' ' + selectTypeColor()
}
</script>

<template>
  <div v-if="settype !== 'defo'" class="flex w-14 justify-end border-l-[1px] border-gray-400" title="ここの設定を使用">
    <button @click="onClick()" :class="actset()" :title="actStatus ? 'この設定を使用' : '上位設定を使用'">
      {{ actStatus ? 'ON' : 'OFF' }}
    </button>
  </div>
</template>
