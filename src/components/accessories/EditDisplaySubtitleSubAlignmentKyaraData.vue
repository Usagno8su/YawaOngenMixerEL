<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  subtitleSetting: 'subAlignment'
  editName: string
  higherUpList: [number, number]
  titleName: string
}>()
import type { dataTextType, outSettingType, subAlignmentSideType } from 'src/type/data-type'
import { SelectSubtitleIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import { subAlignmentView } from '@/data/data'
import SelectDisplaySubAlignmentSide from '@/components/accessories/SelectDisplaySubAlignmentSide.vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'

// どの上位設定を使うか決定する
const higherUpEditKyara = ref<number>(
  SelectSubtitleIndexHigherUpData(props.higherUpList, props.dateList, props.subtitleSetting),
)

const isOpenSubAlignmentSide = ref<boolean>(false)

// 選択画面の開閉を制御
const setIsOpenSubAlignmentSide = (): void => {
  isOpenSubAlignmentSide.value = !isOpenSubAlignmentSide.value
}

// 字幕の配置位置を変更する
const changeSubAlignment = (side: subAlignmentSideType): void => {
  props.dateList[props.selectKyara].subtitle.subAlignment.val = side
}

watch(
  () => props.higherUpList,
  () => {
    higherUpEditKyara.value = SelectSubtitleIndexHigherUpData(props.higherUpList, props.dateList, props.subtitleSetting)
  },
)
</script>

<template>
  <div class="flex border-b-[1px] border-gray-400 py-2">
    <div class="mr-2 flex w-full justify-between">
      <div :title="titleName">{{ editName }}</div>
      <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
      <div class="w-2/3 pl-2">
        <button
          v-if="dateList[selectKyara].subtitle[subtitleSetting].active"
          class="w-fit border border-gray-800 bg-blue-300 px-1 hover:bg-blue-600 hover:text-gray-200"
          @click="setIsOpenSubAlignmentSide"
        >
          {{ subAlignmentView[dateList[selectKyara].subtitle[subtitleSetting].val] }}
        </button>
        <button
          v-else
          class="w-fit border border-gray-800 bg-blue-300 px-1 text-gray-600"
          @click="setIsOpenSubAlignmentSide"
          disabled
        >
          {{ subAlignmentView[dateList[higherUpEditKyara].subtitle[subtitleSetting].val] }}
        </button>
        <div v-if="isOpenSubAlignmentSide && dateList[selectKyara].subtitle[subtitleSetting].active" class="relative">
          <SelectDisplaySubAlignmentSide
            :selectSubAlignmentSide="dateList[selectKyara].subtitle[subtitleSetting].val"
            :clickClose="setIsOpenSubAlignmentSide"
            :changeSubAlignmentSide="changeSubAlignment"
          />
        </div>
      </div>
    </div>
    <SelectDisplayHigherUpStatus
      :settype="props.settype"
      :actStatus="dateList[selectKyara].subtitle[subtitleSetting].active"
      :higherUpType="dateList[higherUpEditKyara].dataType"
      :onClick="
        () =>
          (props.dateList[props.selectKyara].subtitle[props.subtitleSetting].active =
            !props.dateList[props.selectKyara].subtitle[props.subtitleSetting].active)
      "
    />
  </div>
</template>
