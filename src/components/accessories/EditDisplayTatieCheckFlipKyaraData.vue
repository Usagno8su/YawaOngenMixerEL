<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
  editName: string
  titleName: string
}>()
// 立ち絵の上下反転（Flip）と左右反転（Flop）の指定を行う

import type { dataTextType, outSettingType } from 'src/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'

// どの上位設定を使うか決定する
const higherUpEditKyaraFlip = ref<number>(SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieFlip'))
const higherUpEditKyaraFlop = ref<number>(SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieFlop'))

watch(
  () => props.higherUpList,
  () => {
    higherUpEditKyaraFlip.value = SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieFlip')
    higherUpEditKyaraFlop.value = SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, 'tatieFlop')
  },
)
</script>

<template>
  <div class="flex border-b-[1px] border-gray-400 py-2">
    <div class="flex w-1/2">
      <div class="flex w-3/5 justify-between">
        <div :title="titleName">上下反転</div>
        <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
        <div class="w-1/5">
          <input
            v-if="dateList[selectKyara].tatie.tatieFlip.active"
            class=""
            id="tatieFlip"
            type="checkbox"
            v-model="dateList[selectKyara].tatie.tatieFlip.val"
          />
          <input
            v-else
            class=""
            type="checkbox"
            id="tatieFlip"
            :checked="dateList[higherUpEditKyaraFlip].tatie.tatieFlip.val"
            disabled
          />
        </div>
      </div>
      <SelectDisplayHigherUpStatus
        :settype="props.settype"
        :actStatus="dateList[selectKyara].tatie.tatieFlip.active"
        :higherUpType="dateList[higherUpEditKyaraFlip].dataType"
        :onClick="
          () =>
            (props.dateList[props.selectKyara].tatie.tatieFlip.active =
              !props.dateList[props.selectKyara].tatie.tatieFlip.active)
        "
      />
    </div>
    <div class="ml-1 flex w-1/2 border-l-1 border-gray-400 pl-2">
      <div class="flex w-3/5 justify-between">
        <div :title="titleName">左右反転</div>
        <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
        <div class="w-1/5">
          <input
            v-if="dateList[selectKyara].tatie.tatieFlop.active"
            class=""
            id="tatieFlop"
            type="checkbox"
            v-model="dateList[selectKyara].tatie.tatieFlop.val"
          />
          <input
            v-else
            class=""
            type="checkbox"
            id="tatieFlop"
            :checked="dateList[higherUpEditKyaraFlip].tatie.tatieFlop.val"
            disabled
          />
        </div>
      </div>
      <SelectDisplayHigherUpStatus
        :settype="props.settype"
        :actStatus="dateList[selectKyara].tatie.tatieFlop.active"
        :higherUpType="dateList[higherUpEditKyaraFlip].dataType"
        :onClick="
          () =>
            (props.dateList[props.selectKyara].tatie.tatieFlop.active =
              !props.dateList[props.selectKyara].tatie.tatieFlop.active)
        "
      />
    </div>
  </div>
</template>
