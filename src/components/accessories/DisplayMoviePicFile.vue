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

// 保存ダイアログ表示時のディレクトリを指定
const defoDir = ref<string>(null)

// getKyaraImgが二重起動するのを防止する。
const runMakeImg = ref<boolean>(true)

// 立ち絵の存在チェック
const noTatieFile = ref<boolean>(false)

// 変換した立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const data = ref<{ buffer: Uint8Array; path: string }>({ buffer: undefined, path: '' })

const ChangeKyaraImg = () => {
  // データが取得（nullではない）できれば表示する
  if (data.value.buffer !== null) {
    let bobData = new Blob([data.value.buffer], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      img.value = reader.result

      // 立ち絵が存在するのでfalesにする
      noTatieFile.value = false

      // 終わったので戻す
      runMakeImg.value = true
    }

    reader.readAsDataURL(bobData)
  } else {
    // 立ち絵が存在しない
    noTatieFile.value = true
  }
}

const getKyaraImg = async (index?: number) => {
  const indexProfile = index !== undefined ? createVoiceFileEncodeSetting(index, props.dateList) : undefined
  // 立ち絵があり、他の画像取得が動作していない場合のみ実施
  if (indexProfile?.tatie[props.tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID && runMakeImg) {
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
    )
    ChangeKyaraImg()
  } else if (props.settype === 'tatieOrder') {
    // 二重起動しないように値を変更
    runMakeImg.value = false

    console.log('uuuuuuuuaaaaaaaaaaa 2: index: ' + index)
    // 立ち絵画像を変換して取得
    data.value = await enterEncodeTatiePicFile(
      props.tatieSituation,
      props.dateList,
      props.settype,
      props.tatieOrderList,
    )
  }
}

// 変換した立ち絵を保存する
const saveImg = async () => {
  const ans = await enterSaveUint8ArrayFileData(data.value.buffer, defoDir.value)

  // 保存に成功していたら、保存ダイアログ表示時のディレクトリを更新
  if (ans !== null) {
    defoDir.value = ans
  }
}

watch(
  () => {
    props.profile, props.settype, props.tatieSituation
  },
  () => {
    if (props.settype === 'tatieOrder') {
      getKyaraImg()
    } else {
      getKyaraImg(props.selectKyara)
    }
  },
  { deep: true },
)
</script>

<template>
  <img
    v-if="
      profile?.tatie[tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID && typeof img === 'string' && noTatieFile !== true
    "
    :src="img"
    :class="imgClass"
    @click="() => saveImg()"
    title="クリックで変換画像を保存します。"
  />
  <div v-else-if="noTatieFile" :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)">
    立ち絵ファイルが<br />見つかりませんでした
  </div>
  <div v-else :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)">表示に失敗しました</div>
</template>
