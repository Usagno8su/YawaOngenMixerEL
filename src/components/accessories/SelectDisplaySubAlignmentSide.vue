<script setup lang="ts">
const props = defineProps<{
  selectSubAlignmentSide: subAlignmentSideType
  clickClose: () => void
  changeSubAlignmentSide: (side: subAlignmentSideType) => void
}>()

import type { subAlignmentSideType } from '@/type/data-type'

// 選択中の要素の場合は背景色を変更する
const actset = (side: subAlignmentSideType): string => {
  return (
    'px-3 py-2 border-2 border-gray-600' +
    ' ' +
    (props.selectSubAlignmentSide === side
      ? 'bg-blue-300 hover:bg-blue-600 hover:text-gray-200'
      : 'bg-blue-100 hover:bg-blue-600 hover:text-gray-200')
  )
}
</script>

<template>
  <div class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center" @click.self="clickClose">
    <!-- 画面外クリックでクローズ -->
  </div>
  <div class="absolute flex" @click="clickClose">
    <button :class="actset('Left')" @click="changeSubAlignmentSide('Left')">左寄せ</button>
    <button :class="actset('Center')" @click="changeSubAlignmentSide('Center')">中央寄せ</button>
    <button :class="actset('Right')" @click="changeSubAlignmentSide('Right')">右寄せ</button>
  </div>
</template>
