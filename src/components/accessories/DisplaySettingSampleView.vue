<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  higherUpList: [number, number]
  selectKyara: number
}>()
import type { outSettingType, tatieSideType } from '@/type/data-type'
import { SelectTatieSideCSS } from '@/utils/analysisData'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { watch, ref } from 'vue'
import DisplayTatiePicFile from '@/components/accessories/DisplayTatiePicFile.vue'

//// どの設定データが採用されているか確認する。
// 立ち絵の配置位置
const selectListTatieSideData = (): tatieSideType => {
  if (props.dateList[props.selectKyara].tatie.tatieSide.active) {
    return props.dateList[props.selectKyara].tatie.tatieSide.val
  } else {
    return props.dateList[SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieSide')].tatie.tatieSide
      .val
  }
}
// 立ち絵画像のUUID
const selectTatiePicFile = (): string => {
  if (props.dateList[props.selectKyara].tatie.tatieUUID.active) {
    return props.dateList[props.selectKyara].tatie.tatieUUID.val
  } else {
    return props.dateList[SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieUUID')].tatie.tatieUUID
      .val
  }
}

// 設定によって立ち絵の位置を変更する
const setPositionClass = ref<string>(SelectTatieSideCSS(selectListTatieSideData()))

// 設定によって立ち絵画像のUUIDを変更する
const setTatiePicFile = ref<string>(selectTatiePicFile())

// 選択しているキャラ設定が変更されたら変更する
watch(
  () => props.selectKyara,
  () => {
    setPositionClass.value = SelectTatieSideCSS(selectListTatieSideData())
    setTatiePicFile.value = selectTatiePicFile()
  },
)

// 表示している設定が変更されたら立ち絵の位置も変更
watch(
  () => props.dateList[props.selectKyara].tatie.tatieSide,
  () => {
    setPositionClass.value = SelectTatieSideCSS(selectListTatieSideData())
  },
  { deep: true },
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
  <div class="h-36 w-full border-[1px] border-gray-400 p-1" title="位置表示についてはまだ不完全です">
    <div :class="'h-full w-full' + ' ' + setPositionClass">
      <DisplayTatiePicFile :selectTatieFile="setTatiePicFile" imgClass="max-h-14 max-w-14" personOffClass="h-10 w-10" />
    </div>
  </div>
</template>
