<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  settype: dataTextType
  higherUpList: [number, number]
  selectKyara: number
  infoData: infoSettingType
  tatieOrderList: tatieOrderListType[]
}>()
// 立ち絵画像の加工を行って表示します。

import type {
  outSettingType,
  infoSettingType,
  tatieSituationType,
  tatieOrderListType,
  dataTextType,
} from '@/type/data-type'
import { SelectTatieIndexHigherUpData, createVoiceFileEncodeSetting } from '@/utils/analysisData'
import { watch, onUnmounted, ref } from 'vue'
import DisplayMoviePicFile from '@/components/accessories/DisplayMoviePicFile.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'

// 会話中・待機中のどちらの立ち絵を表示するか指定
const tatieSituation = ref<tatieSituationType>('tatieUUID')

////  コンポーネント表示時に、立ち絵画像の表示をも行う
// 表示するプロファイル情報
const profile = ref<outSettingType>(createVoiceFileEncodeSetting(props.selectKyara, props.dateList))
// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<string>(JSON.stringify([profile.value?.tatie, tatieSituation], undefined, 2))

// 指定時間ごとに確認し、立ち絵の設定が変わったら表示を変更する
const onEncodeTatie = setInterval(() => {
  // 比較のために設定内容をJSON形式に変換
  const ans = JSON.stringify(
    [createVoiceFileEncodeSetting(props.selectKyara, props.dateList)?.tatie, tatieSituation],
    undefined,
    2,
  )

  // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
  if (checkConf.value !== ans) {
    profile.value = createVoiceFileEncodeSetting(props.selectKyara, props.dateList)
    checkConf.value = ans
  }
}, 2000)

// コンポーネントが表示されなくなったらsetIntervalを停止
onUnmounted(() => {
  clearInterval(onEncodeTatie)
})
</script>

<template>
  <div class="flex items-start">
    <div class="flex w-6 flex-col text-center text-sm">
      <button
        :class="
          MakeClassString(
            'rounded-tl-lg border-[1px] border-gray-300',
            tatieSituation === 'tatieUUID' ? 'bg-sky-400' : 'bg-gray-200',
          )
        "
        title="会話中の立ち絵を表示します"
        @click="() => (tatieSituation = 'tatieUUID')"
      >
        会話中
      </button>
      <button
        :class="
          MakeClassString(
            'rounded-bl-lg border-[1px] border-gray-300',
            tatieSituation === 'waitTatieUUID' ? 'bg-sky-400' : 'bg-gray-200',
          )
        "
        title="待機中の立ち絵を表示します"
        @click="() => (tatieSituation = 'waitTatieUUID')"
      >
        待機中
      </button>
    </div>
    <div class="h-36 w-full border-[1px] border-gray-400">
      <DisplayMoviePicFile
        :dateList="dateList"
        :settype="settype"
        :selectKyara="selectKyara"
        :infoData="infoData"
        :profile="profile"
        :tatieOrderList="tatieOrderList"
        :tatieSituation="tatieSituation"
        imgClass="w-full h-full"
      />
    </div>
  </div>
</template>
