<script setup lang="ts">
const props = defineProps<{}>()
// outSettingで指定された立ち絵画像のみ変換を行って表示する
// createVoiceFileEncodeSetting()を通した情報を使用する。
// 縮小する場合は、さらにresizeKyaraDateDisplay()を通すこと

import type { outSettingType, tatieSituationType } from '@/type/data-type'
import { ref } from 'vue'
import { EnterEncodeTatieFile } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'

// getKyaraImgが二重起動するのを防止する。
const runMakeImg = ref<boolean>(true)

// 立ち絵の存在チェック
const noRawTatieFile = ref<boolean>(true)

// 変換した立ち絵画像を取得
const rawImg = ref<string | ArrayBuffer>()
const data = ref<{ buffer: Uint8Array; path: string }>({ buffer: null, path: '' })

const ChangeKyaraImg = () => {
  // データが取得（nullではない）できれば表示する
  if (data.value.buffer !== null) {
    let bobData = new Blob([data.value.buffer as BlobPart], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      rawImg.value = reader.result
      // 立ち絵が存在するのでfalesにする
      noRawTatieFile.value = false

      // 終わったので戻す
      runMakeImg.value = true
    }

    reader.readAsDataURL(bobData)
  } else {
    // 立ち絵が存在しない
    noRawTatieFile.value = true
  }
}

const getKyaraImg = async (outSetting: outSettingType, tatieSituation: tatieSituationType) => {
  // 立ち絵があり、他の画像取得が動作していない場合のみ実施
  if (outSetting.tatie[tatieSituation].val !== DEFAULT_KYARA_TATIE_UUID && runMakeImg) {
    // 二重起動しないように値を変更
    runMakeImg.value = false

    console.log('エンコード開始')
    // 立ち絵画像を変換して取得
    data.value = await EnterEncodeTatieFile(outSetting, tatieSituation)
    ChangeKyaraImg()
  } else {
    // 立ち絵が存在しない
    noRawTatieFile.value = true
  }
}

// enterEncodeTatie を親コンポーネントから呼び出せるようにします
defineExpose({ getKyaraImg })
</script>

<template>
  <div v-if="typeof rawImg === 'string' && noRawTatieFile === false">
    <div class="absolute top-0 left-1/2 h-full w-full -translate-x-3/7">
      <img :src="rawImg" class="border border-gray-800" />
    </div>
  </div>
  <div v-else class="absolute top-1 left-3 rounded-md border-gray-200 bg-white px-6 py-3">読み込み中</div>
</template>
