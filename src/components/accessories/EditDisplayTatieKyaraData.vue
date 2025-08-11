<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  tatieSetting: tatieSettingType
  higherUpList: [number, number]
  editName: string
  inputMin?: string
  inputMax?: string
  titleName: string
}>()
import type { dataTextType, outSettingType, tatieSettingType } from 'src/type/data-type'
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
      <input
        v-if="dateList[selectKyara].tatie[tatieSetting].active"
        class="w-2/3"
        :id="tatieSetting"
        type="number"
        :min="inputMin"
        :max="inputMax"
        v-model="dateList[selectKyara].tatie[tatieSetting].val"
      />
      <input
        v-else
        class="w-2/3"
        :id="tatieSetting"
        type="number"
        :placeholder="dateList[higherUpEditKyara].tatie[tatieSetting].val.toString()"
        disabled
      />
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
