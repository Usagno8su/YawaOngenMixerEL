<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  tatieSetting: 'tatieConp'
  higherUpList: [number, number]
  editName: string
  titleName: string
}>()
import type { dataTextType, outSettingType } from 'src/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'

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
    <div class="mr-2 flex w-full justify-between">
      <div :title="titleName">{{ editName }}</div>
      <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
      <div class="w-2/3">
        <input
          v-if="dateList[selectKyara].tatie[tatieSetting].active"
          class="ml-1"
          :id="tatieSetting"
          type="checkbox"
          v-model="dateList[selectKyara].tatie[tatieSetting].val"
        />
        <input
          v-else
          class="ml-1"
          type="checkbox"
          :id="tatieSetting"
          :checked="dateList[higherUpEditKyara].tatie[tatieSetting].val"
          disabled
        />
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
