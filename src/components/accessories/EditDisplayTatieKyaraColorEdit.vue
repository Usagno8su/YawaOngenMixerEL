<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  tatieSetting: tatieSettingType
  higherUpList: [number, number]
  editName: string
  titleName: string
}>()
// 立ち絵のカラーエフェクトを設定。

import type { dataTextType, outSettingType, tatieSettingType, tatieColorSelectStyleType } from 'src/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'
import SelectDisplayTatieKyaraColorType from '@/components/accessories/SelectDisplayTatieKyaraColorType.vue'

const ChangeTatieColor = (select: tatieColorSelectStyleType): void => {
  props.dateList[props.selectKyara].tatie.colorEdit.val.selectStyle = select
}

const isOpen = ref<boolean>(false)

// 設定のリスト
const selectList = { default: 'なし', colorspace: '白黒', negate: '色反転', sepiaTone: 'セピア調' }

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

      <div class="flex w-2/3 flex-col justify-center">
        <div v-if="dateList[selectKyara].tatie.colorEdit.active" class="flex w-full">
          <button
            class="ml-2 w-20 border border-gray-800 bg-blue-300 px-1 text-sm hover:bg-blue-600 hover:text-gray-200"
            @click="() => (isOpen = true)"
          >
            {{ selectList[dateList[selectKyara].tatie.colorEdit.val.selectStyle] }}
          </button>
          <input
            v-if="dateList[selectKyara].tatie.colorEdit.val.selectStyle === 'sepiaTone'"
            class="ml-3 w-1/3"
            type="number"
            min="0"
            max="100"
            v-model="dateList[selectKyara].tatie.colorEdit.val.sepiaToneOption"
          />
        </div>
        <button v-else class="w-1/2 border border-gray-800 bg-blue-300 px-1 text-sm text-gray-600" disabled>
          {{ selectList[dateList[higherUpEditKyara].tatie.colorEdit.val.selectStyle] }}
        </button>
        <div v-if="isOpen && dateList[selectKyara].tatie.colorEdit.active" class="relative">
          <SelectDisplayTatieKyaraColorType
            :selectTatieColor="dateList[selectKyara].tatie.colorEdit.val.selectStyle"
            :ClickClose="() => (isOpen = false)"
            :ChangeTatieColor="(select: tatieColorSelectStyleType) => ChangeTatieColor(select)"
            :selectList="selectList"
          />
        </div>

        <div v-if="dateList[selectKyara].tatie.colorEdit.active" class="w-full"></div>
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
