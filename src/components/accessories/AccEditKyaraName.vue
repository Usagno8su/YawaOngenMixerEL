<script setup lang="ts">
const props = defineProps<{
  accClass: string
  onInData: (index?: number) => void
  editKyaraName: outSettingType
  kyast: boolean
  isNewOpen: boolean
  index?: number
}>()

import { outSettingType } from '@/type/data-type'
import { ref, nextTick, watch } from 'vue'

const inputFocus = ref<HTMLInputElement>()

const areaRef = ref<HTMLDivElement>()

// 入力欄が開かれた場合の操作
watch(
  () => props.isNewOpen,
  () => {
    if (props.isNewOpen) {
      // 入力欄にフォーカスする
      nextTick(() => {
        inputFocus.value.focus()
        areaRef.value.scrollHeight // 一番下までスクロールする
      })
    }
  },
)
</script>

<template>
  <div :class="accClass" v-if="isNewOpen">
    <input
      type="text"
      class="mt-1 w-full bg-yellow-100 p-1"
      @keydown.enter="onInData(index)"
      placeholder="キャラ名を入力"
      v-model="editKyaraName.name"
      ref="inputFocus"
    />
    <div v-show="kyast" class="flex items-center justify-end text-lg">
      （
      <input
        type="text"
        class="mt-1 w-3/4 rounded-md bg-yellow-100 p-1"
        v-model="editKyaraName.kyaraStyle"
        @keydown.enter="onInData(index)"
        placeholder="スタイルを入力"
      />
      ）
    </div>
  </div>
  <!-- 一番下までスクロールさせるために設置 -->
  <div ref="areaRef"></div>
</template>
