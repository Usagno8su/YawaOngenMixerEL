<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  higherUpList: [number, number]
  selectKyara: number
  infoData: infoSettingType
}>()
import type { outSettingType, tatieSideType, infoSettingType } from '@/type/data-type'
import { SelectTatieSideCSS } from '@/utils/analysisData'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { watch, ref } from 'vue'
import DisplayTatiePicFile from '@/components/accessories/DisplayTatiePicFile.vue'
import DisplayMoviePicFile from '@/components/accessories/DisplayMoviePicFile.vue'
import { MakeClassString } from '@/utils/analysisGeneral'

const onAutoImg = ref<boolean>(false)

//// どの設定データが採用されているか確認する。
// 立ち絵画像のUUID
const selectTatiePicFile = (): string => {
  if (props.dateList[props.selectKyara].tatie.tatieUUID.active) {
    return props.dateList[props.selectKyara].tatie.tatieUUID.val
  } else {
    return props.dateList[SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieUUID')].tatie.tatieUUID
      .val
  }
}

// 設定によって立ち絵画像のUUIDを変更する
const setTatiePicFile = ref<string>(selectTatiePicFile())

// 選択しているキャラ設定が変更されたら変更する
watch(
  () => props.selectKyara,
  () => {
    setTatiePicFile.value = selectTatiePicFile()
  },
)

// 表示している設定が変更されたら立ち絵の画像も変更
watch(
  () => props.dateList[props.selectKyara].tatie.tatieUUID,
  () => {
    setTatiePicFile.value = selectTatiePicFile()
  },
  { deep: true },
)
</script>

<template>
  <div class="relative h-36 w-full border-[1px] border-gray-400 p-1" title="位置表示についてはまだ不完全です">
    <DisplayMoviePicFile
      :selectTatieFile="setTatiePicFile"
      :dateList="dateList"
      :index="selectKyara"
      :infoData="infoData"
      imgClass="w-full h-full"
      :autoGetImage="onAutoImg"
    />
    <div
      class="absolute left-1 top-1 flex rounded-xl border border-gray-400 opacity-30 hover:bg-sky-300 hover:bg-opacity-40 hover:opacity-100"
      title="切り替えたときに、すぐ画像の加工を行います"
    >
      <input type="checkbox" class="ml-1" v-model="onAutoImg" />
      <div class="mx-1">自動表示</div>
    </div>
  </div>
</template>
