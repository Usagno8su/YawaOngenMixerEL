<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  settype: dataTextType
  higherUpList: [number, number]
  selectKyara: number
  infoData: infoSettingType
  tatieOrderList: tatieOrderListType[]
  isFileTatieOrderSetting: boolean
  size: { w: number; h: number }
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
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { onUnmounted, ref, watch, onMounted } from 'vue'
import DisplaySampleView from '@/components/accessories/DisplaySampleView.vue'
import { MakeClassString, resizeKyaraDateDisplay } from '@/utils/analysisGeneral'

// サムネイル用
const refDisplaySampleView = ref<{ [key: string]: InstanceType<typeof DisplaySampleView> | null }>({})
const refShowSingle = ref<InstanceType<typeof DisplaySampleView> | null>(null)
// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<{ [key: string]: string }>({})

// 会話中・待機中のどちらの立ち絵を表示するか指定
const tatieSituation = ref<tatieSituationType>('tatieUUID')

// 立ち絵エンコード用にresizeKyaraDateDisplay()を通したデータを作成
const encodeSetting = ref<outSettingType>(
  resizeKyaraDateDisplay(createVoiceFileEncodeSetting(props.selectKyara, props.dateList), props.size),
)

const reversedtatieOrderList = ref<tatieOrderListType[]>([...props.tatieOrderList].reverse())

// settypeによって、表示する立ち絵を決める。
// "defo"か"kyara"か"kyast"の場合は立ち絵をselectKyaraで指定したものだけ表示させる。
// "seid"か"tatieOrder"の場合はtatieOrderListで指定したものを表示させる。
let showOrderList: boolean = false
let showKyaraUUID: string = props.dateList[props.selectKyara].uuid
const SelectSettypeKyaraUUID = () => {
  if (props.settype === 'tatieOrder' || props.settype === 'seid') {
    showOrderList = true
    showKyaraUUID = null
  } else if (props.selectKyara !== -1) {
    showOrderList = false
    showKyaraUUID = props.dateList[props.selectKyara].uuid
  } else {
    // selectKyaraが-1の場合は何も表示しない
    showOrderList = false
    showKyaraUUID = null
  }
}

// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<{ [key: string]: string }>({})

// 指定時間ごとに確認し、立ち絵の設定が変わったら表示を変更する
const onEncodeTatie = setInterval(() => {
  // 複数立ち絵が必要な場合はtatieOrderListを見る
  if (props.settype === 'tatieOrder' || props.settype === 'seid') {
    // tatieOrderList の順番や数に変更があれば reversedtatieOrderList を上書きする
    const tempReversedtatieOrderList = [...props.tatieOrderList].reverse()
    const checkNewTatieOrderList = reversedtatieOrderList.value.findIndex(
      (e, i) => e.uuid !== tempReversedtatieOrderList[i].uuid,
    )
    if (checkNewTatieOrderList !== -1) {
      reversedtatieOrderList.value = [...tempReversedtatieOrderList]
    }

    for (const item of reversedtatieOrderList.value) {
      const tatieKyara = props.dateList.findIndex((e) => item.settingUUID === e.uuid)
      const itemSituation = props.selectKyara === tatieKyara ? tatieSituation.value : item.tatieSituation

      if (tatieKyara != -1) {
        encodeSetting.value = resizeKyaraDateDisplay(
          createVoiceFileEncodeSetting(tatieKyara, props.dateList),
          props.size,
        )

        // キャラが未選択でなければ実行
        if (props.selectKyara !== -1 && encodeSetting.value.tatie[itemSituation].val !== DEFAULT_KYARA_TATIE_UUID) {
          // 比較のために設定内容をJSON形式に変換
          const ans = JSON.stringify(encodeSetting.value, undefined, 2) + itemSituation.toString()

          // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
          if (checkConf.value[item.uuid] !== ans && refDisplaySampleView.value[item.uuid] !== undefined) {
            console.log('エンコード実行')
            refDisplaySampleView.value[item.uuid].getKyaraImg(encodeSetting.value, itemSituation)
            checkConf.value[item.uuid] = ans
          }
        }
      }
    }
  } else {
    encodeSetting.value = resizeKyaraDateDisplay(
      createVoiceFileEncodeSetting(props.selectKyara, props.dateList),
      props.size,
    )

    // キャラが未選択でなければ実行
    if (props.selectKyara !== -1 && encodeSetting.value.tatie[tatieSituation.value].val !== DEFAULT_KYARA_TATIE_UUID) {
      // 比較のために設定内容をJSON形式に変換
      const ans = JSON.stringify(encodeSetting.value, undefined, 2) + tatieSituation.value.toString()

      // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
      if (checkConf.value['refShowSingle'] !== ans && refDisplaySampleView.value[0] !== null) {
        console.log('エンコード実行')
        refShowSingle.value.getKyaraImg(encodeSetting.value, tatieSituation.value)
        checkConf.value['refShowSingle'] = ans
      }
    }
  }
}, 3000)

// 設定通りのサイズでエンコードした立ち絵画像を保存
const RawSaveTatie = async () => {
  // const ans = await enterSaveUint8ArrayFileData(data.value.buffer, defoDir.value)
  // 保存に成功していたら、保存ダイアログ表示時のディレクトリを更新
  // if (ans !== null) {
  //   defoDir.value = ans
  // }
}

// コンポーネントが表示されなくなったらsetIntervalを停止
onUnmounted(() => {
  clearInterval(onEncodeTatie)
})

// settypeが"defo"か"kyara"か"kyast"の場合は立ち絵をselectKyaraで指定したものだけ表示させる。
watch(
  () => [props.settype, props.selectKyara],
  () => {
    SelectSettypeKyaraUUID()
  },
)
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
    <div class="relative flex h-38 w-72 items-center justify-center border-[1px] border-gray-400">
      <div v-show="showOrderList">
        <div v-for="(item, index) in reversedtatieOrderList" :key="item.uuid">
          <DisplaySampleView
            :ref="(el) => (refDisplaySampleView[item.uuid] = el as InstanceType<typeof DisplaySampleView> | null)"
          />
        </div>
      </div>
      <div v-show="!showOrderList && showKyaraUUID !== null">
        <DisplaySampleView imgClass="max-h-[150px] w-full" ref="refShowSingle" />
      </div>
    </div>
  </div>
</template>
