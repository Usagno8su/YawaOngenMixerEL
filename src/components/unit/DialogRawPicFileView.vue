<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  GetRawImg: () => Promise<void>
  data: { buffer: Uint8Array; path: string }
  rawImg: string | ArrayBuffer
  noRawTatieFile: boolean
}>()
// 加工済み立ち絵画像を拡大表示する（本来の大きさでエンコードする）

// コンポーネントが表示して0.1秒後に立ち絵のエンコードと表示を実行
setTimeout(() => props.GetRawImg(), 100)
</script>

<template>
  <div
    class="fixed top-0 right-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60"
    @click.stop="() => clickClose()"
  >
    <!-- 画面クリックでクローズ -->
    <div v-if="typeof rawImg === 'string' && noRawTatieFile === false" class="bg-white">
      <img :src="rawImg" class="border border-gray-400" />
    </div>
    <div v-else class="bg-white">読み込み中</div>
  </div>
</template>
