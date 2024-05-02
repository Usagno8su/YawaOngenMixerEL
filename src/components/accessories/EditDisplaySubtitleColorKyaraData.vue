<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  subtitleSetting: subtitleSettingType
  editName: string
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
      <div class="w-2/3">
        <div v-if="dateList[selectKyara].subtitle[subtitleSetting].active" class="flex items-center">
          <input
            class="ml-1"
            :id="subtitleSetting"
            type="color"
            v-model="dateList[selectKyara].subtitle[subtitleSetting].val"
          />
          <input
            class="ml-5 w-20 font-mono"
            :id="subtitleSetting"
            v-model="dateList[selectKyara].subtitle[subtitleSetting].val"
          />
        </div>
        <div v-else class="flex items-center">
          <input
            class="ml-1"
            :id="subtitleSetting"
            type="color"
            :value="dateList[higherUpEditKyara].subtitle[subtitleSetting].val as string"
            disabled
          />
          <div class="ml-5 font-mono text-gray-600">
            {{ dateList[higherUpEditKyara].subtitle[subtitleSetting].val as string }}
          </div>
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
