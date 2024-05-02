<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  tatieSetting: 'tatieSide'
  higherUpList: [number, number]
  editName: string
  titleName: string
}>()
import type { dataTextType, outSettingType, tatieSideType } from 'src/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import SelectDisplayTatieSide from '@/components/accessories/SelectDisplayTatieSide.vue'
import { ref, watch } from 'vue'
import { tatieSideView } from '@/data/data'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'

const isOpenTatieSide = ref<boolean>(false)

// 選択画面の開閉を制御
const setIsOpenTatieSide = (): void => {
  isOpenTatieSide.value = !isOpenTatieSide.value
}

// 立ち絵の配置位置を変更する
const changeTatieSide = (side: tatieSideType): void => {
  props.dateList[props.selectKyara].tatie.tatieSide.val = side
}

// どの上位設定を使うか決定する
const higherUpEditKyara = ref<number>(
  SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, props.tatieSetting),
)

watch(
  () => props.higherUpList,
  () => {
    higherUpEditKyara.value = SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, props.tatieSetting)
  },
)
</script>

<template>
  <div class="flex border-b-[1px] border-gray-400 py-2">
    <div class="mr-1 flex w-full justify-between">
      <div :title="titleName">{{ editName }}</div>
      <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
      <div class="w-2/3">
        <button
          v-if="dateList[selectKyara].tatie[tatieSetting].active"
          class="w-fit border border-gray-800 bg-blue-300 px-1 hover:bg-blue-600 hover:text-gray-200"
          @click="setIsOpenTatieSide"
        >
          {{ tatieSideView[dateList[selectKyara].tatie[tatieSetting].val] }}
        </button>
        <button v-else class="w-fit border border-gray-800 bg-blue-300 px-1 text-gray-600" disabled>
          {{ tatieSideView[dateList[higherUpEditKyara].tatie[tatieSetting].val] }}
        </button>
        <div v-if="isOpenTatieSide && dateList[selectKyara].tatie[tatieSetting].active" class="relative">
          <SelectDisplayTatieSide
            :selectTatieSide="dateList[selectKyara].tatie[tatieSetting].val"
            :clickClose="setIsOpenTatieSide"
            :changeTatieSide="changeTatieSide"
          />
        </div>
      </div>
    </div>
    <SelectDisplayHigherUpStatus
      :settype="props.settype"
      :actStatus="dateList[selectKyara].tatie[tatieSetting].active"
      :higherUpType="dateList[higherUpEditKyara].dataType"
      :onClick="
        () =>
          (props.dateList[props.selectKyara].tatie[props.tatieSetting].active =
            !props.dateList[props.selectKyara].tatie[props.tatieSetting].active)
      "
    />
  </div>
</template>
