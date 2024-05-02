<script setup lang="ts">
// 全体設定

const props = defineProps<{
  clickClose: () => void
  classSetting?: string
}>()

import { ref } from 'vue'
import MainSetting from '@/components/accessories/GlobalSetting/MainSetting.vue'
import AboutSoft from '@/components/accessories/GlobalSetting/AboutSoft.vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { MakeClassString } from '@/utils/analysisGeneral'

const openSelectSetting = ref<string>('main')

const setSettingView = (type: string): void => {
  openSelectSetting.value = type
}
</script>

<template>
  <div :class="classSetting">
    <div class="mb-2 ml-2 flex items-start justify-between">
      <div class="text-xl font-bold">全体設定</div>
      <button @click="() => clickClose()">
        <MaterialIcons icon="Close" />
      </button>
    </div>
    <div class="flex">
      <div class="w-1/5 border border-gray-600 p-1">
        <button
          :class="
            MakeClassString(
              'mb-1 h-14 w-full rounded-sm border border-gray-600 hover:bg-blue-500 hover:text-gray-200',
              openSelectSetting === 'main' ? 'bg-blue-400' : 'bg-blue-200',
            )
          "
          @click="setSettingView('main')"
        >
          基本設定
        </button>
        <button
          :class="
            MakeClassString(
              'mb-1 h-14 w-full rounded-sm border border-gray-600 hover:bg-blue-500 hover:text-gray-200',
              openSelectSetting === 'aboutSoft' ? 'bg-blue-400' : 'bg-blue-200',
            )
          "
          @click="setSettingView('aboutSoft')"
        >
          このソフトについて
        </button>
      </div>
      <div class="w-4/5 border border-gray-600 p-1">
        <MainSetting v-if="openSelectSetting === 'main'" />
        <AboutSoft v-if="openSelectSetting === 'aboutSoft'" />
      </div>
    </div>
  </div>
</template>
