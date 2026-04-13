<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    absoluteClass?: string
    imgClass?: string
  }>(),
  { absoluteClass: 'top-0 left-0' },
)
// outSettingで指定された立ち絵画像のみ変換を行って表示する
// createVoiceFileEncodeSetting()を通した情報を使用する。
// 縮小する場合は、さらにresizeKyaraDateDisplay()を通すこと

import type { outSettingType, tatieSituationType } from '@/type/data-type'
import { ref } from 'vue'
import { EnterEncodeTatieFile } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'

// 設定変更の比較チェックのため、内容を文字列に変換して保存する変数
const checkConf = ref<string>('')

// 変換した立ち絵画像を取得
const rawImg = ref<string | ArrayBuffer | null>()
const data = ref<{ buffer: Uint8Array; path: string }>({ buffer: new Uint8Array(), path: '' })

const ChangeKyaraImg = () => {
  // データが取得（nullではない）できれば表示する
  if (data.value.buffer !== null) {
    let bobData = new Blob([data.value.buffer as BlobPart], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      rawImg.value = reader.result
    }

    reader.readAsDataURL(bobData)
  }
}

const getKyaraImg = async (outSetting: outSettingType, tatieSituation: tatieSituationType) => {
  // 比較のために設定内容をJSON形式に変換
  const ans = JSON.stringify(outSetting, undefined, 2) + tatieSituation.toString()

  // 立ち絵があり、confの内容が異なる場合のみ実施
  if (outSetting.tatie[tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID && checkConf.value !== ans) {
    console.log('エンコード開始: ' + outSetting.name)
    // 立ち絵画像を変換して取得
    data.value = await EnterEncodeTatieFile(outSetting, tatieSituation)
    ChangeKyaraImg()

    // 結果を保存
    checkConf.value = ans
  }
}

// enterEncodeTatie を親コンポーネントから呼び出せるようにします
defineExpose({ getKyaraImg })
</script>

<template>
  <div v-if="typeof rawImg === 'string'">
    <div :class="MakeClassString('absolute', absoluteClass)">
      <img :src="rawImg" :class="MakeClassString('border border-gray-800', imgClass ?? '')" />
    </div>
  </div>
  <div v-else class="absolute top-1 left-1/3 rounded-md border-gray-200 bg-white px-6 py-3">未選択</div>
</template>
