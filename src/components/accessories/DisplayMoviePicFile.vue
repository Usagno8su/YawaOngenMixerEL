<script setup lang="ts">
const props = defineProps<{
  selectTatieFile: string
  dateList: outSettingType[]
  index: number
  infoData: infoSettingType
  imgClass?: string
  autoGetImage?: boolean
}>()
// 立ち絵画像のみ変換を行って表示する

import type { outSettingType, infoSettingType } from '@/type/data-type'
import { ref, watch } from 'vue'
import { enterEncodeTatiePicFile } from '@/utils/analysisFile'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { createVoiceFileEncodeSetting } from '@/utils/analysisData'
import { MakeClassString } from '@/utils/analysisGeneral'

// 立ち絵の表示を制御
const onImg = ref<boolean>(props.autoGetImage ?? false)

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
    onImg.value = true // 画像を表示
  }

  reader.readAsDataURL(bobData)
}

// 立ち絵の設定が変わったら表示を変更する
watch(
  () => props.dateList[props.index].tatie,
  () => {
    // 自動表示がONの場合は変換を再実施
    if (props.autoGetImage) {
      getKyaraImg(props.selectTatieFile)
    } else {
      onImg.value = false // 非表示にする
    }
  },
  { deep: true },
)
// 自動表示がONになったら変換をずぐに実施
watch(
  () => props.autoGetImage,
  () => {
    if (props.autoGetImage === true && props.selectTatieFile !== DEFAULT_KYARA_TATIE_UUID) {
      getKyaraImg(props.selectTatieFile)
    }
  },
)
</script>

<template>
  <img
    v-if="selectTatieFile !== DEFAULT_KYARA_TATIE_UUID && typeof img === 'string' && onImg"
    :src="img"
    :class="imgClass"
  />
  <button
    v-else
    :class="MakeClassString('rounded-lg bg-sky-100 hover:bg-sky-500 hover:text-gray-200', imgClass)"
    @click="() => getKyaraImg(selectTatieFile)"
  >
    変換する場合はここをクリック
  </button>
</template>
