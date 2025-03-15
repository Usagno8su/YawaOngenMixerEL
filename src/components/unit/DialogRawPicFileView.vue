<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  GetRawImg: () => Promise<void>
  SaveRawImg: () => Promise<void>
  data: { buffer: Uint8Array; path: string }
  rawImg: string | ArrayBuffer
  noRawTatieFile: boolean
}>()
// 加工済み立ち絵画像を拡大表示する（本来の大きさでエンコードする）

import { ref } from 'vue'

const tatieBgColor = ref<string>('#ffffff')

// コンポーネントが表示して0.1秒後に立ち絵のエンコードと表示を実行
setTimeout(() => props.GetRawImg(), 100)
</script>

<template>
  <div
    class="fixed top-0 right-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60"
    @click.stop="() => clickClose()"
  >
    <!-- 画面クリックでクローズ -->
    <div v-if="typeof rawImg === 'string' && noRawTatieFile === false">
      <div class="flex justify-start bg-gray-300/25">
        <button
          @click="() => SaveRawImg()"
          class="my-2 ml-2 w-20 cursor-pointer rounded-2xl border bg-sky-400/100 py-1 hover:bg-sky-600/100 hover:text-gray-100"
        >
          保存
        </button>
        <div
          @click.stop=""
          class="mx-4 my-2 flex items-center justify-center rounded-md bg-gray-100"
          title="テストのため、画像の後方の色を変更できます"
        >
          <input class="ml-3" id="bg-color" type="color" v-model="tatieBgColor" />
          <input class="mx-3 w-22 border bg-white" id="bg-text" type="text" v-model="tatieBgColor" />
        </div>
      </div>
      <div class="mx-2" :style="'background-color:' + tatieBgColor">
        <img :src="rawImg" class="border border-gray-800" />
      </div>
    </div>
    <div v-else class="rounded-md border-gray-200 bg-white px-6 py-3">読み込み中</div>
  </div>
</template>
