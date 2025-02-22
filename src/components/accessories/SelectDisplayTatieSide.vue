<script setup lang="ts">
const props = defineProps<{
  selectTatieSide: tatieSideType
  clickClose: () => void
  changeTatieSide: (side: tatieSideType) => void
}>()

import type { tatieSideType } from '@/type/data-type'

// 選択中の要素の場合は背景色を変更する
const actset = (side: tatieSideType): string => {
  return (
    'px-3 py-2 border-2 border-gray-600' +
    ' ' +
    (props.selectTatieSide === side
      ? 'bg-blue-300 hover:bg-blue-600 hover:text-gray-200'
      : 'bg-blue-100 hover:bg-blue-600 hover:text-gray-200')
  )
}
</script>

<template>
  <div class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center" @click.self="clickClose">
    <!-- 画面外クリックでクローズ -->
  </div>
  <div class="absolute" @click="clickClose">
    <div class="flex">
      <button :class="actset('NorthWest')" @click="changeTatieSide('NorthWest')">上段左</button>
      <button :class="actset('North')" @click="changeTatieSide('North')">上段中央</button>
      <button :class="actset('NorthEast')" @click="changeTatieSide('NorthEast')">上段右</button>
    </div>
    <div class="flex">
      <button :class="actset('West')" @click="changeTatieSide('West')">中段左</button>
      <button :class="actset('Center')" @click="changeTatieSide('Center')">中段中央</button>
      <button :class="actset('East')" @click="changeTatieSide('East')">中段右</button>
    </div>
    <div class="flex">
      <button :class="actset('SouthWest')" @click="changeTatieSide('SouthWest')">下段左</button>
      <button :class="actset('South')" @click="changeTatieSide('South')">下段中央</button>
      <button :class="actset('SouthEast')" @click="changeTatieSide('SouthEast')">下段右</button>
    </div>
  </div>
</template>
