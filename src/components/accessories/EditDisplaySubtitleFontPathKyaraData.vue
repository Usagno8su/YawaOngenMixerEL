<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  subtitleSetting: 'fontsPath'
  editName: string
  higherUpList: [number, number]
  titleName: string
}>()
import type { dataTextType, outSettingType } from 'src/type/data-type'
import { SelectSubtitleIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'
import { changeFilePath } from '@/utils/analysisFile'
import { MakeClassString } from '@/utils/analysisGeneral'

// どの上位設定を使うか決定する
const higherUpEditKyara = ref<number>(
  SelectSubtitleIndexHigherUpData(props.higherUpList, props.dateList, props.subtitleSetting),
)

// ボタンに表示するファイルの名前を選択する
const useFontFileName = (): string => {
  if (props.dateList[props.selectKyara].subtitle[props.subtitleSetting].active) {
    return props.dateList[props.selectKyara].subtitle[props.subtitleSetting].val
  } else {
    return props.dateList[higherUpEditKyara.value].subtitle[props.subtitleSetting].val
  }
}

// フォントファイルを選択する。
const changeFile = async (): Promise<void> => {
  const ans = await changeFilePath('', 'フォントファイルを選択', 'FontFile', ['ttc'])

  // null やundefinedでなければ書き込む
  if (ans ?? false) {
    props.dateList[props.selectKyara].subtitle[props.subtitleSetting].val = ans
  }
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
      <button
        :class="
          MakeClassString(
            'h-full w-2/3 truncate border border-gray-800 bg-blue-300 px-1',
            dateList[selectKyara].subtitle[subtitleSetting].active
              ? 'hover:bg-blue-600 hover:text-gray-200'
              : 'text-gray-600',
          )
        "
        @click="changeFile()"
        :title="useFontFileName()"
        :disabled="!dateList[selectKyara].subtitle[subtitleSetting].active"
      >
        {{ useFontFileName() }}
      </button>
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
