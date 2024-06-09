<script setup lang="ts">
const props = defineProps<{
  selectTatieFile: string
  dateList: outSettingType[]
  index: number
  infoData: infoSettingType
  imgClass?: string
}>()
// 立ち絵画像のみ変換を行って表示する

import type { outSettingType, infoSettingType } from '@/type/data-type'
import { ref, watch } from 'vue'
import { enterEncodeTatiePicFile } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { createVoiceFileEncodeSetting } from '@/utils/analysisData'

// 変換した立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const getKyaraImg = async (sta: string) => {
  // 立ち絵画像を変換して取得
  const data = await enterEncodeTatiePicFile(
    createVoiceFileEncodeSetting(props.dateList[props.index], props.index, props.dateList, props.infoData),
  )

  let bobData = new Blob([data.buffer], { type: 'image/png' })
  // ファイreaderを作成
  let reader = new FileReader()

  // 読み込み完了時の処理を設定
  reader.onload = () => {
    img.value = reader.result
  }

  reader.readAsDataURL(bobData)
}
if (props.selectTatieFile !== DEFAULT_KYARA_TATIE_UUID) {
  getKyaraImg(props.selectTatieFile)
}

// 立ち絵の設定が変わったら表示する画像も変更する
watch(
  () => props.dateList[props.index].tatie,
  () => {
    getKyaraImg(props.selectTatieFile)
  },
  { deep: true },
)
</script>

<template>
  <img v-if="selectTatieFile !== DEFAULT_KYARA_TATIE_UUID && typeof img === 'string'" :src="img" :class="imgClass" />
  <div v-else>変換する場合はここをクリック</div>
</template>
