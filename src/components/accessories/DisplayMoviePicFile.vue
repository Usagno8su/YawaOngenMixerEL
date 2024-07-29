<script setup lang="ts">
const props = defineProps<{
  selectTatieFile: string
  dateList: outSettingType[]
  index: number
  infoData: infoSettingType
  imgClass?: string
}>()
// 立ち絵画像のみ変換を行って表示する

import type { outSettingType, infoSettingType, encodeProfileSendReType } from '@/type/data-type'
import { ref, onUnmounted } from 'vue'
import { enterEncodeTatiePicFile, enterSaveUint8ArrayFileData } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { createVoiceFileEncodeSetting } from '@/utils/analysisData'
import { MakeClassString } from '@/utils/analysisGeneral'

// 保存ダイアログ表示時のディレクトリを指定
const defoDir = ref<string>(null)

// getKyaraImgが二重起動するのを防止する。
const runMakeImg = ref<boolean>(true)

// 変換した立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const data = ref<{ buffer: Uint8Array; path: string }>({ buffer: undefined, path: '' })
const getKyaraImg = async (profile: encodeProfileSendReType) => {
  // 立ち絵があり、他の画像取得が動作していない場合のみ実施
  if (profile.settingList.tatie.tatieUUID.val !== DEFAULT_KYARA_TATIE_UUID && runMakeImg) {
    // 二重起動しないように値を変更
    runMakeImg.value = false

    // 立ち絵画像を変換して取得
    data.value = await enterEncodeTatiePicFile(profile)

    let bobData = new Blob([data.value.buffer], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      img.value = reader.result

      // 終わったので戻す
      runMakeImg.value = true
    }

    reader.readAsDataURL(bobData)
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

// コンポーネント表示時に、立ち絵画像の表示をも行う
const profile = ref<encodeProfileSendReType>(
  createVoiceFileEncodeSetting(props.dateList[props.index], props.index, props.dateList, props.infoData),
)
getKyaraImg(profile.value)
const checkConf = ref<string>(JSON.stringify(profile.value.settingList.tatie, undefined, 2))

// 指定時間ごとに確認し、立ち絵の設定が変わったら表示を変更する
const onEncodeTatie = setInterval(() => {
  // 比較のために設定内容をJSON形式に変換
  profile.value = createVoiceFileEncodeSetting(props.dateList[props.index], props.index, props.dateList, props.infoData)
  const ans = JSON.stringify(profile.value.settingList.tatie, undefined, 2)

  // 比較して前回の内容と異なっていれば立ち絵画像の表示を更新する。
  if (checkConf.value !== ans) {
    getKyaraImg(profile.value)
    checkConf.value = ans
  }
}, 2000)

// コンポーネントが表示されなくなったらsetIntervalを停止
onUnmounted(() => {
  clearInterval(onEncodeTatie)
})
</script>

<template>
  <img
    v-if="selectTatieFile !== DEFAULT_KYARA_TATIE_UUID && typeof img === 'string'"
    :src="img"
    :class="imgClass"
    @click="() => saveImg()"
    title="クリックで変換画像を保存します。"
  />
  <div
    v-else-if="selectTatieFile === DEFAULT_KYARA_TATIE_UUID"
    :class="MakeClassString('flex items-center justify-center bg-sky-100', imgClass)"
  >
    未選択です
  </div>
</template>
