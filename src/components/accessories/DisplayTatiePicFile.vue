<script setup lang="ts">
const props = defineProps<{
  selectTatieFile: string
  imgClass?: string
  personOffClass?: string
  sizeHeight?: number // 高さをピクセルで指定したい場合は設定する
}>()
// 立ち絵画像の表示を行う

import { ref, watch } from 'vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
const { yomAPI } = window

// 立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const getKyaraImg = async (sta: string) => {
  // 立ち絵画像を取得
  // 高さをピクセルで指定した場合はその高さで縮小された画像が取得される。
  const data = yomAPI.getKyraPicFileData(sta, props.sizeHeight)

  // データが取得（nullではない）できれば表示する
  if (data !== null) {
    let bobData = new Blob([data], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      img.value = reader.result
    }

    reader.readAsDataURL(bobData)
  } else {
    // 取得できなかったら非表示状態にする。
    img.value = null
  }
}
if (props.selectTatieFile !== DEFAULT_KYARA_TATIE_UUID) {
  getKyaraImg(props.selectTatieFile)
}

// 立ち絵IDが変わったら取得する画像も変更する
watch(
  () => props.selectTatieFile,
  () => {
    getKyaraImg(props.selectTatieFile)
  },
)
</script>

<template>
  <img v-if="selectTatieFile !== DEFAULT_KYARA_TATIE_UUID && typeof img === 'string'" :src="img" :class="imgClass" />
  <MaterialIcons v-else icon="PersonOff" :classString="personOffClass" titleString="立ち絵非表示" />
</template>
