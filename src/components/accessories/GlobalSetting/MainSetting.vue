<script setup lang="ts">
const props = defineProps<{
  classString?: string
}>()

import { ref, watch } from 'vue'
import { globalSettingType } from '@/type/data-type'
import { getGlobalSetting, writeGlobalSetting } from '@/utils/analysisData'
import { MakeClassString } from '@/utils/analysisGeneral'

// 全体設定を読み込み
const globalSettingList = ref<globalSettingType>(getGlobalSetting())

// 設定を未保存かどうか
const seveStatus = ref<boolean>(false)

// 設定を保存する
const saveEnter = (): void => {
  const ans = writeGlobalSetting(globalSettingList.value)
  seveStatus.value = !ans
}

// 設定に編集があったときにはtrueを入れる
watch(
  () => globalSettingList.value,
  () => {
    seveStatus.value = true
  },
  { deep: true },
)
</script>

<template>
  <div :class="classString">
    <div class="flex items-center justify-between">
      <div class="mb-2 ml-2 text-lg font-bold">基本設定</div>
      <button
        :class="
          MakeClassString(
            'rounded-lg border border-black px-2 py-1',
            seveStatus === true ? 'bg-red-500 hover:bg-yellow-500 hover:text-gray-900' : 'bg-gray-200 text-gray-500',
          )
        "
        @click="saveEnter()"
        :disabled="!seveStatus"
      >
        {{ seveStatus === true ? '設定保存' : '保存済み' }}
      </button>
    </div>
    <div class="m-1">
      <div>
        <div class="mt-3 text-xl font-medium">FFmpegのパス</div>
        <div class="mx-2 mt-1 border border-gray-600 p-1">
          <input class="w-full" v-model="globalSettingList.exeFilePath.ffmpeg" @keydown.enter="saveEnter()" />
        </div>
      </div>
    </div>
  </div>
</template>
