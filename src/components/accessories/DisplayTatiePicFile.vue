<script setup lang="ts">
const props = defineProps<{
  selectTatieFile: string
  imgClass?: string
  personOffClass?: string
}>()
// 立ち絵画像の表示を行う

import { ref, watch } from 'vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
const { yomAPI } = window

// 立ち絵画像を取得
const img = ref<string | ArrayBuffer>()
const getKyaraImg = async (sta: string) => {
  const data = yomAPI.getKyraPicFileData(sta)

  let bobData = new Blob([data], { type: 'image/png' })
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
