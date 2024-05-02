<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  subtitleSetting: subtitleSettingType
  editName: string
  inputMin?: string
  inputMax?: string
  inputStep?: string
  higherUpList: [number, number]
  titleName: string
}>()
import type { dataTextType, outSettingType, subtitleSettingType } from 'src/type/data-type'
import { SelectSubtitleIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'

// どの上位設定を使うか決定する
const higherUpEditKyara = ref<number>(
  SelectSubtitleIndexHigherUpData(props.higherUpList, props.dateList, props.subtitleSetting),
)

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
      <input
        v-if="dateList[selectKyara].subtitle[subtitleSetting].active"
        class="w-2/3"
        :id="subtitleSetting"
        type="number"
        :min="inputMin"
        v-model="dateList[selectKyara].subtitle[subtitleSetting].val"
      />
      <input
        v-else
        class="w-2/3"
        :id="subtitleSetting"
        type="number"
        :placeholder="dateList[higherUpEditKyara].subtitle[subtitleSetting].val.toString()"
        disabled
      />
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
