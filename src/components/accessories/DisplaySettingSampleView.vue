<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  higherUpList: [number, number]
  selectKyara: number
  infoData: infoSettingType
  onSampleView: boolean // 立ち絵の加工と表示を行うか選択
}>()
// 立ち絵画像の加工を行って表示します。

import type { outSettingType, infoSettingType } from '@/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { watch, ref } from 'vue'
import DisplayMoviePicFile from '@/components/accessories/DisplayMoviePicFile.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'

// 会話中・待機中のどちらの立ち絵を表示するか指定
const tatieSituation = ref<'tatieUUID' | 'waitTatieUUID'>('tatieUUID')

//// どの設定データが採用されているか確認する。
// 立ち絵画像のUUID
const selectTatiePicFile = (): string => {
  if (props.onSampleView) {
    if (props.dateList[props.selectKyara].tatie[tatieSituation.value].active) {
      return props.dateList[props.selectKyara].tatie[tatieSituation.value].val
    } else {
      return props.dateList[SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, tatieSituation.value)]
        .tatie[tatieSituation.value].val
    }
  } else {
    return DEFAULT_KYARA_TATIE_UUID
  }
}

// 設定によって立ち絵画像のUUIDを変更する
const setTatiePicFile = ref<string>(selectTatiePicFile())

// 選択しているキャラ設定が変更されたら変更する
watch(
  () => {
    props.selectKyara, tatieSituation.value
  },
  () => {
    setTatiePicFile.value = selectTatiePicFile()
  },
)

// 表示している設定が変更されたら立ち絵の画像も変更
// キャラが選択されているか確認して、実行する。
watch(
  () => props.onSampleView && props.dateList[props.selectKyara].tatie[tatieSituation.value],
  () => {
    setTatiePicFile.value = selectTatiePicFile()
  },
  { deep: true },
)
</script>

<template>
  <div class="flex items-start">
    <div class="flex w-6 flex-col text-center text-sm">
      <button
        :class="
          MakeClassString(
            'rounded-tl-lg border-[1px] border-gray-300',
            tatieSituation === 'tatieUUID' ? 'bg-sky-400' : 'bg-gray-200',
          )
        "
        title="会話中の立ち絵を表示します"
        @click="() => (tatieSituation = 'tatieUUID')"
      >
        会話中
      </button>
      <button
        :class="
          MakeClassString(
            'rounded-bl-lg border-[1px] border-gray-300',
            tatieSituation === 'waitTatieUUID' ? 'bg-sky-400' : 'bg-gray-200',
          )
        "
        title="待機中の立ち絵を表示します"
        @click="() => (tatieSituation = 'waitTatieUUID')"
      >
        待機中
      </button>
    </div>
    <div
      class="h-36 w-full border-[1px] border-gray-400"
      v-if="onSampleView && setTatiePicFile !== DEFAULT_KYARA_TATIE_UUID"
    >
      <DisplayMoviePicFile
        :dateList="dateList"
        :index="selectKyara"
        :infoData="infoData"
        :tatieSituation="tatieSituation"
        imgClass="w-full h-full"
      />
    </div>
    <div v-else class="flex h-36 w-full items-center justify-center border-[1px] border-gray-400 p-1">未選択です</div>
  </div>
</template>
