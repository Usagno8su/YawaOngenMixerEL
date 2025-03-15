<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    dateList: outSettingType[]
    settype: dataTextType
    selectKyara: number
    tatieSituation: tatieSituationType
    infoData: infoSettingType
    profile: outSettingType
    tatieOrderList: tatieOrderListType[]
    isFileTatieOrderSetting: boolean
    imgClass?: string
  }>(),
  { tatieSituation: 'tatieUUID' },
)
// 立ち絵画像のみ変換を行って表示する

import type {
  outSettingType,
  infoSettingType,
  tatieSituationType,
  tatieOrderListType,
  dataTextType,
} from '@/type/data-type'
import { ref, watch } from 'vue'
import { enterEncodeTatiePicFile, enterSaveUint8ArrayFileData } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { createVoiceFileEncodeSetting } from '@/utils/analysisData'
import { MakeClassString } from '@/utils/analysisGeneral'
import DialogRawPicFileView from '@/components/unit/DialogRawPicFileView.vue'

// 保存ダイアログ表示時のディレクトリを指定
const defoDir = ref<string>(null)

// getKyaraImgが二重起動するのを防止する。
const runMakeImg = ref<boolean>(true)

// 立ち絵の存在チェック
const noTatieFile = ref<boolean>(false)
const noRawTatieFile = ref<boolean>(false)

//  加工済み立ち絵画像を本来の大きさでエンコードして表示する画面を開く
const isRawPicFileView = ref<boolean>(false)

// 変換した立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const rawImg = ref<string | ArrayBuffer>()
const data = ref<{ buffer: Uint8Array; path: string }>({ buffer: undefined, path: '' })

// サムネイル画像の出力サイズを制限
const size: { w: number; h: number } = { w: 256, h: 144 }

const ChangeKyaraImg = (rawEnable?: boolean) => {
  // データが取得（nullではない）できれば表示する
  if (data.value.buffer !== null) {
    let bobData = new Blob([data.value.buffer], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      if (rawEnable) {
        rawImg.value = reader.result
        // 立ち絵が存在するのでfalesにする
        noRawTatieFile.value = false
      } else {
        img.value = reader.result

        // 立ち絵が存在するのでfalesにする
        noTatieFile.value = false
      }

      // 終わったので戻す
      runMakeImg.value = true
    }

    reader.readAsDataURL(bobData)
  } else {
    // 立ち絵が存在しない
    noTatieFile.value = true
  }
}

const getKyaraImg = async (index?: number, localSize?: { w: number; h: number }) => {
  // indexが存在する値を示しているか確認します。
  const ChkIndex = (): outSettingType | undefined => {
    if (index === -1 || index === undefined || props.dateList[index] === undefined) {
      return undefined
    } else {
      return createVoiceFileEncodeSetting(index, props.dateList)
    }
  }

  // プロファイルを確認
  const indexProfile = ChkIndex()

  // 立ち絵があり、他の画像取得が動作していない場合のみ実施
  if (
    indexProfile !== undefined &&
    indexProfile?.tatie[props.tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID &&
    runMakeImg
  ) {
    // 二重起動しないように値を変更
    runMakeImg.value = false

    console.log('uuuuuuuuaaaaaaaaaaa1 index: ' + index)
    // 立ち絵画像を変換して取得
    data.value = await enterEncodeTatiePicFile(
      props.tatieSituation,
      props.dateList,
      props.settype,
      props.tatieOrderList,
      index,
      localSize,
    )

    // 本来の大きさでエンコードして表示(localSize === undefined)の際にはtrueを入れる。
    ChangeKyaraImg(localSize === undefined)
  } else if ((props.settype === 'tatieOrder' || props.settype === 'seid') && props.tatieOrderList.length !== 0) {
    // 立ち絵順序の設定の項目か音声ファイル個別の設定を表示しており、tatieOrderListに設定があれば実行

    // 二重起動しないように値を変更
    runMakeImg.value = false

    console.log('uuuuuuuuaaaaaaaaaaa 2: index: ' + index)
    // 立ち絵画像を変換して取得
    data.value = await enterEncodeTatiePicFile(
      props.tatieSituation,
      props.dateList,
      props.settype,
      props.tatieOrderList,
      undefined,
      localSize,
    )

    // 本来の大きさでエンコードして表示(localSize === undefined)の際にはtrueを入れる。
    ChangeKyaraImg(localSize === undefined)
  } else {
    // 立ち絵が存在しない
    noTatieFile.value = true
  }
}

// 設定通りのサイズでエンコードした立ち絵画像を保存
const SaveRawImg = async () => {
  const ans = await enterSaveUint8ArrayFileData(data.value.buffer, defoDir.value)
  // 保存に成功していたら、保存ダイアログ表示時のディレクトリを更新
  if (ans !== null) {
    defoDir.value = ans
  }
}

// 設定通りのサイズの立ち絵画像をエンコード
const GetRawImg = async () => {
  if (props.settype === 'tatieOrder') {
    await getKyaraImg(undefined)
  } else {
    await getKyaraImg(props.selectKyara)
  }
}

// 立ち絵サムネイルの変更処理を実行
// 作成の際には、サイズを縮小する
const EnterGetKyaraImg = () => {
  if (props.settype === 'tatieOrder') {
    getKyaraImg(undefined, size)
  } else {
    getKyaraImg(props.selectKyara, size)
  }
}

// enterEncodeTatie を親コンポーネントから呼び出せるようにします
defineExpose({ EnterGetKyaraImg })

watch(
  () => [props.profile, props.settype, props.selectKyara],
  () => {
    EnterGetKyaraImg()
  },
  { deep: true },
)
</script>

<template>
  <button
    v-if="
      (settype === 'tatieOrder' ||
        settype === 'seid' ||
        profile?.tatie[tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID) &&
      typeof img === 'string' &&
      noTatieFile !== true
    "
    :class="
      MakeClassString(
        'flex items-center justify-center',
        isRawPicFileView || !runMakeImg ? 'cursor-wait' : 'cursor-pointer',
        imgClass,
      )
    "
    @click="
      () => {
        isRawPicFileView = true
      }
    "
    :disabled="isRawPicFileView || !runMakeImg"
    title="クリックで変換画像を拡大表示します。"
  >
    <img :src="img" class="border border-gray-400" :width="size.w" :height="size.h" />
  </button>
  <div
    v-else-if="profile?.tatie[tatieSituation].val === DEFAULT_KYARA_TATIE_UUID"
    :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)"
  >
    未選択です
  </div>
  <div v-else-if="noTatieFile" :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)">
    立ち絵ファイルが<br />見つかりませんでした
  </div>
  <div v-else :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)">表示に失敗しました</div>
  <DialogRawPicFileView
    :clickClose="
      () => {
        isRawPicFileView = false
        rawImg = null
      }
    "
    :GetRawImg="() => GetRawImg()"
    :SaveRawImg="() => SaveRawImg()"
    :data="data"
    :rawImg="rawImg"
    :noRawTatieFile="noRawTatieFile"
    v-if="isRawPicFileView"
  />
</template>
