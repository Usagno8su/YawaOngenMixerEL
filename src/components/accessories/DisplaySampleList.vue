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
import { createVoiceFileEncodeSetting, FindAllString } from '@/utils/analysisData'
import { makeTatiePicEncodeList, EnterEncodeSaveTatieFile } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { onUnmounted, ref, watch } from 'vue'
import DisplaySampleView from '@/components/accessories/DisplaySampleView.vue'
import DialogRawLIstFileView from '@/components/unit/DialogRawLIstFileView.vue'
import { MakeClassString, resizeKyaraDateDisplay } from '@/utils/analysisGeneral'

// サムネイル用
const refDisplaySampleView = ref<{ [key: string]: InstanceType<typeof DisplaySampleView> | null }>({})
const refShowSingle = ref<InstanceType<typeof DisplaySampleView> | null>(null)
// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<{ [key: string]: string }>({})

// 原寸大用
const refDisplayRawView = ref<{ [key: string]: InstanceType<typeof DisplaySampleView> | null }>({})
const refShowRawSingle = ref<{ [key: string]: InstanceType<typeof DisplaySampleView> | null }>({})
const openDialog = ref<boolean>(false)

// 立ち絵の拡大表示時の背景色を保存
const tatieBgColor = ref<string>('#ffffff')

// 保存ダイアログ表示時のディレクトリを指定
const defoDir = ref<string>(undefined)

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
const showOrderList = ref<boolean>(false)
const showKyaraUUID = ref<string>(props.selectKyara !== -1 ? props.dateList[props.selectKyara].uuid : null)
const SelectSettypeKyaraUUID = () => {
  if (props.settype === 'tatieOrder' || props.settype === 'seid') {
    showOrderList.value = true
  } else {
    showOrderList.value = false
  }
  showKyaraUUID.value = props.selectKyara !== -1 ? props.dateList[props.selectKyara].uuid : null
}

// どのtatieSituationを選択するか決める。
// settype が'seid'の場合は、selectKyaraの音声ファイルで会話中のキャラは、tatieSituation.valueで指定された値にする必要がある。
// また、そのときにはcreateVoiceFileEncodeSetting()に渡すdateListの配列番号もprops.selectKyaraにする必要がある
const ItemSelectSituation = (
  item: tatieOrderListType,
  encodeKyara: number,
  actKyara: outSettingType,
): { tatieSituation: tatieSituationType; selectKyara: boolean } => {
  if (props.settype === 'tatieOrder') {
    return { tatieSituation: item.tatieSituation, selectKyara: false }
  } else {
    // キャラ名が一致するかと、立ち絵の設定が有効になっているか確認する。
    const tatieKyara =
      FindAllString(props.dateList[encodeKyara].name, [actKyara.name]) &&
      props.dateList[encodeKyara].tatie[tatieSituation.value].active

    if (item.dataType === 'kyara') {
      return tatieKyara
        ? { tatieSituation: tatieSituation.value, selectKyara: true }
        : { tatieSituation: item.tatieSituation, selectKyara: false }
    } else {
      // dataType が 'kyast' の場合にはスタイルも一致するか確認する
      return tatieKyara && actKyara.kyaraStyle === props.dateList[encodeKyara].kyaraStyle
        ? { tatieSituation: tatieSituation.value, selectKyara: true }
        : { tatieSituation: item.tatieSituation, selectKyara: false }
    }
  }
}

// 指定時間ごとに確認し、立ち絵の設定が変わったら表示を変更する
const onEncodeTatie = setInterval(() => {
  // 複数立ち絵が必要な場合はtatieOrderListを見る
  if (props.selectKyara !== -1 && (props.settype === 'tatieOrder' || props.settype === 'seid')) {
    // tatieOrderList の順番や数に変更があれば reversedtatieOrderList を上書きする
    const tempReversedtatieOrderList = [...props.tatieOrderList].reverse()
    const checkNewTatieOrderList = reversedtatieOrderList.value.findIndex(
      (e, i) => e.uuid !== tempReversedtatieOrderList[i].uuid,
    )
    if (checkNewTatieOrderList !== -1) {
      reversedtatieOrderList.value = [...tempReversedtatieOrderList]
    }

    // 現在選択中のキャラ設定か音声ファイルの情報を取得
    const actKyara = props.dateList[props.selectKyara]

    for (const item of reversedtatieOrderList.value) {
      // UUIDからどのキャラをエンコードするか確認する
      const encodeKyara = props.dateList.findIndex((e) => e.uuid === item.settingUUID)

      // tatieSituationの設定を決める。
      const itemSituation = ItemSelectSituation(item, encodeKyara, actKyara)

      if (encodeKyara != -1) {
        // 立ち絵のエンコード情報を作成する。
        encodeSetting.value = resizeKyaraDateDisplay(
          createVoiceFileEncodeSetting(
            props.settype === 'seid' && itemSituation.selectKyara ? props.selectKyara : encodeKyara,
            props.dateList,
          ),
          props.size,
        )

        // キャラが未選択でなければ実行
        if (encodeSetting.value.tatie[itemSituation.tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID) {
          // 比較のために設定内容をJSON形式に変換
          const ans = JSON.stringify(encodeSetting.value, undefined, 2) + itemSituation.toString()

          // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
          if (checkConf.value[item.uuid] !== ans && refDisplaySampleView.value[item.uuid] !== undefined) {
            console.log('エンコード実行')
            refDisplaySampleView.value[item.uuid].getKyaraImg(encodeSetting.value, itemSituation.tatieSituation)
            checkConf.value[item.uuid] = ans
          }
        }
      }
    }
  } else if (props.selectKyara !== -1) {
    encodeSetting.value = resizeKyaraDateDisplay(
      createVoiceFileEncodeSetting(props.selectKyara, props.dateList),
      props.size,
    )

    // キャラが未選択でなければ実行
    if (props.selectKyara !== -1 && encodeSetting.value.tatie[tatieSituation.value].val !== DEFAULT_KYARA_TATIE_UUID) {
      // 比較のために設定内容をJSON形式に変換
      const ans = JSON.stringify(encodeSetting.value, undefined, 2) + tatieSituation.value.toString()

      // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
      if (checkConf.value['refShowSingle'] !== ans && refShowSingle.value !== null) {
        console.log('エンコード実行')
        refShowSingle.value.getKyaraImg(encodeSetting.value, tatieSituation.value)
        checkConf.value['refShowSingle'] = ans
      }
    }
  }
}, 3000)

// 拡大表示用
// 設定された元のサイズで立ち絵画像のエンコードを実施する。
const RawEncodeTatie = () => {
  // 複数立ち絵が必要な場合はtatieOrderListを見る
  if (props.selectKyara !== -1 && (props.settype === 'tatieOrder' || props.settype === 'seid')) {
    // 現在選択中のキャラ設定か音声ファイルの情報を取得
    const actKyara = props.dateList[props.selectKyara]

    for (const item of reversedtatieOrderList.value) {
      // UUIDからどのキャラをエンコードするか確認する
      const encodeKyara = props.dateList.findIndex((e) => e.uuid === item.settingUUID)

      // tatieSituationの設定を決める。
      const itemSituation = ItemSelectSituation(item, encodeKyara, actKyara)

      if (encodeKyara != -1) {
        // 立ち絵のエンコード情報を作成する。
        encodeSetting.value = createVoiceFileEncodeSetting(
          props.settype === 'seid' && itemSituation.selectKyara ? props.selectKyara : encodeKyara,
          props.dateList,
        )

        // キャラが未選択でなければ実行
        if (encodeSetting.value.tatie[itemSituation.tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID) {
          console.log('エンコード実行')
          refDisplayRawView.value[item.uuid].getKyaraImg(encodeSetting.value, itemSituation.tatieSituation)
        }
      }
    }
  } else if (props.selectKyara !== -1) {
    encodeSetting.value = createVoiceFileEncodeSetting(props.selectKyara, props.dateList)

    // キャラが未選択でなければ実行
    if (props.selectKyara !== -1 && encodeSetting.value.tatie[tatieSituation.value].val !== DEFAULT_KYARA_TATIE_UUID) {
      refShowRawSingle.value.refSingle.getKyaraImg(encodeSetting.value, tatieSituation.value)
    }
  }
}

// 立ち絵の拡大表示を行ってもいいか判断し、問題なければ開く
const ClickRawOpen = () => {
  // 立ち絵リスト表示か、キャラが選択されている場合、表示を行う
  if (showOrderList.value || showKyaraUUID.value !== null) {
    openDialog.value = true
  }
}

// 立ち絵の拡大表示時の動作
// 表示画面を閉じる他に、背景色を保存
const ClickRawClose = (bgColor: string) => {
  tatieBgColor.value = bgColor
  openDialog.value = false
}

// 設定通りのサイズでエンコードした立ち絵画像を保存
const RawSaveTatie = async () => {
  // 設定を変換して送付
  const ans = await EnterEncodeSaveTatieFile(
    makeTatiePicEncodeList(
      tatieSituation.value,
      props.dateList,
      props.settype,
      props.tatieOrderList,
      !showOrderList.value ? props.selectKyara : undefined,
    ),
    'Image',
    ['png'],
    defoDir.value,
  )

  // 保存に成功していたら、保存ダイアログ表示時のディレクトリを更新
  if (ans !== null) {
    defoDir.value = ans
  }
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
    <button
      class="relative flex h-38 w-72 items-center justify-center border-[1px] border-gray-400"
      @click="() => ClickRawOpen()"
    >
      <div v-show="showOrderList">
        <div v-for="(item, index) in reversedtatieOrderList" :key="item.uuid">
          <DisplaySampleView
            absoluteClass="top-0.5 left-1"
            :ref="(el) => (refDisplaySampleView[item.uuid] = el as InstanceType<typeof DisplaySampleView> | null)"
          />
        </div>
      </div>
      <div v-show="!showOrderList && showKyaraUUID !== null">
        <DisplaySampleView absoluteClass="top-0.5 left-1" imgClass="max-h-[150px] w-full" ref="refShowSingle" />
      </div>
    </button>
    <DialogRawLIstFileView
      :clickClose="(bgColor: string) => ClickRawClose(bgColor)"
      :RawEncodeTatie="() => RawEncodeTatie()"
      :RawSaveTatie="() => RawSaveTatie()"
      :reversedtatieOrderList="reversedtatieOrderList"
      :refDisplayRawView="showOrderList ? refDisplayRawView : refShowRawSingle"
      :tatieBgColor="tatieBgColor"
      :showOrderList="showOrderList"
      v-if="openDialog"
    />
  </div>
</template>
