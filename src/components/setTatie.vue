<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
  fileListTatie: fileListTatieType[]
}>()

import type { dataTextType, outSettingType, fileListTatieType } from 'src/type/data-type'
import EditDisplayTatieKyaraData from '@/components/accessories/EditDisplayTatieKyaraData.vue'
import EditDisplayTatiePicPathKyaraData from '@/components/accessories/EditDisplayTatiePicPathKyaraData.vue'
import EditDisplayTatieCheckboxKyaraData from '@/components/accessories/EditDisplayTatieCheckboxKyaraData.vue'
import EditDisplayTatieSideKyaraData from '@/components/accessories/EditDisplayTatieSideKyaraData.vue'
import EditDisplayTatieKyaraRotate from '@/components/accessories/EditDisplayTatieKyaraRotate.vue'
import EditDisplayTatieKyaraColorEdit from '@/components/accessories/EditDisplayTatieKyaraColorEdit.vue'
</script>

<template>
  <div class="w-full">
    <EditDisplayTatiePicPathKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      :fileListTatie="fileListTatie"
      tatieSetting="tatieUUID"
      editName="立ち絵画像ファイル"
      titleName="立ち絵の画像ファイルを指定します"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="moviW"
      editName="画面の横(px)"
      inputMin="0"
      titleName="作成する動画の横の長さを指定します"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="moviH"
      editName="画面の縦(px)"
      inputMin="0"
      titleName="作成する動画の縦の長さを指定します"
    />
    <EditDisplayTatieKyaraColorEdit
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="colorEdit"
      editName="カラー設定"
      titleName="立ち絵の色を加工します"
    />
    <EditDisplayTatieCheckboxKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="tatieConp"
      editName="立ち絵の加工"
      titleName="画像ファイルの加工を行うか指定。動画の大きさに合わせて加工済みの立ち絵を指定している場合はoffにしてください"
    />
    <EditDisplayTatieSideKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="tatieSide"
      editName="配置位置"
      titleName="立ち絵を画面のどこに配置するか指定します"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="tatieHpx"
      editName="立ち絵の高さ(％)"
      inputMin="0"
      titleName="立ち絵を動画の高さの何％にするか指定します"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="tatiePwPs"
      editName="立ち絵を横移動(％)"
      titleName="「配置位置」で指定した場所から指定された分だけ横移動させます"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="tatiePhPs"
      editName="立ち絵を縦移動(％)"
      titleName="「配置位置」で指定した場所から指定された分だけ縦移動させます"
    />
    <EditDisplayTatieKyaraRotate
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="rotate"
      editName="立ち絵の傾き"
      titleName="指定した角度で立ち絵を表示します"
    />
    <EditDisplayTatieKyaraData
      :settype="settype"
      :dateList="dateList"
      :selectKyara="selectKyara"
      :higherUpList="higherUpList"
      tatieSetting="fps"
      editName="フレームレート(fps)"
      inputMin="0"
      titleName="動画のFPSを指定します（通常はそのままにしてください）"
    />
  </div>
</template>
