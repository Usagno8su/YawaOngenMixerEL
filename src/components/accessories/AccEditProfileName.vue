<script setup lang="ts">
const props = defineProps<{
  classSetting?: string
  onChange: (uuid: string) => void
  editProfile: kyaraProfileListType
}>()

import { ref, nextTick, watch } from 'vue'
import { kyaraProfileListType } from '@/type/data-type'
import { MakeClassString } from '@/utils/analysisGeneral'

const inputFocus = ref<HTMLInputElement>()

const areaRef = ref<HTMLDivElement>()

// 入力欄にフォーカスする
nextTick(() => {
  inputFocus.value.focus()
  areaRef.value.scrollHeight // 一番下までスクロールする
})
</script>

<template>
  <div :class="MakeClassString(classSetting, 'px-1')" ref="areaRef">
    <input
      type="text"
      class="w-full bg-yellow-100 p-1"
      @keydown.enter="() => onChange(editProfile.uuid)"
      placeholder="プロファイル名を入力"
      v-model="editProfile.displayName"
      ref="inputFocus"
    />
  </div>
</template>
