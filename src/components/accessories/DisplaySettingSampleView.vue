<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  settype: dataTextType
  higherUpList: [number, number]
  selectKyara: number
  infoData: infoSettingType
  tatieOrderList: tatieOrderListType[]
  isFileTatieOrderSetting: boolean
}>()
// 立ち絵画像の加工を行って表示します。

import type {
  outSettingType,
  infoSettingType,
  tatieSituationType,
  tatieOrderListType,
  dataTextType,
} from '@/type/data-type'
import { createVoiceFileEncodeSetting } from '@/utils/analysisData'
import { onUnmounted, ref } from 'vue'
import DisplayMoviePicFile from '@/components/accessories/DisplayMoviePicFile.vue'
import { MakeClassString } from '@/utils/analysisGeneral'

// 会話中・待機中のどちらの立ち絵を表示するか指定
const tatieSituation = ref<tatieSituationType>('tatieUUID')

const refDisplayMoviePicFile = ref<InstanceType<typeof DisplayMoviePicFile> | null>(null)

////  コンポーネント表示時に、立ち絵画像の表示をも行う
// 表示するプロファイル情報
const profile = ref<outSettingType>(createVoiceFileEncodeSetting(props.selectKyara, props.dateList))
// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<string>(
  JSON.stringify(createVoiceFileEncodeSetting(props.selectKyara, props.dateList)?.tatie, undefined, 2) +
    tatieSituation.value +
    JSON.stringify(props.tatieOrderList, undefined, 2),
)

// 立ち絵の表示を更新
const enterEncodeTatie = () => {
  profile.value = createVoiceFileEncodeSetting(props.selectKyara, props.dateList)
  refDisplayMoviePicFile.value.EnterGetKyaraImg()
  checkConf.value =
    JSON.stringify(createVoiceFileEncodeSetting(props.selectKyara, props.dateList)?.tatie, undefined, 2) +
    tatieSituation.value +
    JSON.stringify(props.tatieOrderList, undefined, 2)
}

// enterEncodeTatie を親コンポーネントから呼び出せるようにします
defineExpose({ enterEncodeTatie })

// 指定時間ごとに確認し、立ち絵の設定が変わったら表示を変更する
const onEncodeTatie = setInterval(() => {
  // キャラが未選択でなければ実行
  if (props.selectKyara !== -1) {
    // 比較のために設定内容をJSON形式に変換
    const ans =
      JSON.stringify(createVoiceFileEncodeSetting(props.selectKyara, props.dateList)?.tatie, undefined, 2) +
      tatieSituation.value +
      JSON.stringify(props.tatieOrderList, undefined, 2)

    // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
    if (checkConf.value !== ans) {
      enterEncodeTatie()
    }
  }
}, 2000)

// コンポーネントが表示されなくなったらsetIntervalを停止
onUnmounted(() => {
  clearInterval(onEncodeTatie)
})
</script>

<template>
  <div class="flex items-start">
    <div class="flex w-6 flex-col text-center text-sm" v-if="settype !== 'tatieOrder'">
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
    <div class="flex w-6 flex-col text-center text-sm" v-else>
      <div class="rounded-l-lg border-[1px] border-gray-300 bg-sky-400">待機中</div>
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
        :isFileTatieOrderSetting="isFileTatieOrderSetting"
        imgClass="w-full h-full"
        ref="refDisplayMoviePicFile"
      />
    </div>
  </div>
</template>
