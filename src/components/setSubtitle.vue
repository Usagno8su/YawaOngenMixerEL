<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
}>()

import type { outSettingType, dataTextType } from '@/type/data-type'
import EditDisplaySubtitleNumberKyaraData from '@/components/accessories/EditDisplaySubtitleNumberKyaraData.vue'
import EditDisplaySubtitleCheckboxKyaraData from '@/components/accessories/EditDisplaySubtitleCheckboxKyaraData.vue'
import EditDisplaySubtitleColorKyaraData from '@/components/accessories/EditDisplaySubtitleColorKyaraData.vue'
import EditDisplaySubtitleFontPathKyaraData from '@/components/accessories/EditDisplaySubtitleFontPathKyaraData.vue'
import EditDisplaySubtitleSubAlignmentKyaraData from '@/components/accessories/EditDisplaySubtitleSubAlignmentKyaraData.vue'
</script>

<template>
  <div class="w-full">
    <EditDisplaySubtitleCheckboxKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subText"
      editName="字幕表示"
      titleName="字幕表示を行うか指定します"
    />
    <EditDisplaySubtitleFontPathKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="fontsPath"
      editName="フォントファイル"
      titleName="フォントファイルを指定します"
    />
    <EditDisplaySubtitleSubAlignmentKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subAlignment"
      editName="文字の位置"
      titleName="文字の位置を指定します"
    />
    <EditDisplaySubtitleCheckboxKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subAutoRt"
      editName="自動改行"
      titleName="画面の横幅に合わせて自動で改行を入れるか指定します"
    />
    <EditDisplaySubtitleCheckboxKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subTextBord"
      editName="文字のフチに着色"
      titleName="字幕の文字に色付きのフチをつけるか指定します"
    />
    <EditDisplaySubtitleCheckboxKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subBG"
      editName="背景色をつける"
      titleName="字幕に背景色をつけるか指定します"
    />
    <EditDisplaySubtitleNumberKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subSize"
      editName="フォントサイズ(px)"
      inputMin="0"
      titleName="文字のサイズを指定します"
    />
    <!-- 背景色をつけない時の、文字下の空きスペース -->
    <EditDisplaySubtitleNumberKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subTextSpaceSize"
      editName="動画端の空白(px)"
      inputMin="0"
      titleName="字幕と動画端との間に隙間を配置します"
    />
    <EditDisplaySubtitleColorKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subColor"
      editName="フォントカラー"
      titleName="字幕の色を指定します"
    />
    <EditDisplaySubtitleColorKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subOrdercr"
      editName="フォントのフチの色"
      titleName="字幕のフチの色を指定します"
    />
    <!-- フォントまわりのフチのサイズ -->
    <EditDisplaySubtitleNumberKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subBorderW"
      editName="フチのサイズ(px)"
      inputMin="0"
      titleName="フチの太さを指定します"
    />
    <EditDisplaySubtitleColorKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subBgcolor"
      editName="背景色"
      titleName="背景の色を指定します"
    />
    <EditDisplaySubtitleNumberKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      subtitleSetting="subBgTr"
      editName="背景の透明度"
      inputMin="0"
      inputMax="1"
      inputStep="0.01"
      titleName="背景の透明度を指定します（0〜1の間）"
    />
  </div>
</template>
