<script setup lang="ts">
const props = defineProps<{
  selectTatieColor: string
  ClickClose: () => void
  ChangeTatieColor: (select: tatieColorSelectStyleType) => void
  selectList: { [key in tatieColorSelectStyleType]: string }
}>()

import type { tatieColorSelectStyleType } from 'src/type/data-type'
import { MakeClassString } from '@/utils/analysisGeneral'
</script>

<template>
  <div class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center" @click.self="() => ClickClose()">
    <!-- 画面外クリックでクローズ -->
  </div>
  <div class="absolute" @click="() => ClickClose()">
    <div
      v-for="(item, key) in selectList"
      v-bind:key="key"
      :class="
        MakeClassString(
          'border-2 border-gray-600 px-3 py-2 hover:bg-blue-600 hover:text-gray-200',
          selectTatieColor === key ? 'bg-blue-300' : 'bg-blue-100',
        )
      "
      @click="() => ChangeTatieColor(key)"
    >
      {{ item }}
    </div>
  </div>
</template>
