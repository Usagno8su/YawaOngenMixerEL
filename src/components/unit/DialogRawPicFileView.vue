<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  RawImg: () => Promise<void>
  data: { buffer: Uint8Array; path: string }
}>()
// 加工済み立ち絵画像を拡大表示する（本来の大きさでエンコードする）

import { ref } from 'vue'

// 立ち絵の存在チェック
const noTatieFile = ref<boolean>(true)

const img = ref<string | ArrayBuffer>()

// 画像を表示
const ChangeKyaraImg = async (): Promise<void> => {
  // データが取得（nullではない）できれば表示する
  if (props.data.buffer !== null) {
    let bobData = new Blob([props.data.buffer], { type: 'image/png' })
    // ファイreaderを作成
    let reader = new FileReader()

    // 読み込み完了時の処理を設定
    reader.onload = () => {
      img.value = reader.result

      // 立ち絵が存在するのでfalesにする
      noTatieFile.value = false
    }

    reader.readAsDataURL(bobData)
  } else {
    // 立ち絵が存在しない
    noTatieFile.value = true
  }
}

// コンポーネントが表示して0.1秒後に立ち絵のエンコードと表示を実行
setTimeout(async () => props.RawImg().then(() => ChangeKyaraImg()), 100)

</script>

<template>
  <div
    class="fixed top-0 right-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60"
    @click.stop="() => clickClose()"
  >
    <!-- 画面クリックでクローズ -->
    <div v-if="typeof img === 'string' && noTatieFile === false" class="bg-white">
      <img :src="img" class="border border-gray-400" />
    </div>
    <div v-else class="bg-white">読み込み中</div>
  </div>
</template>
