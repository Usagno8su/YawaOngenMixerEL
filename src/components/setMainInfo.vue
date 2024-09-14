<script setup lang="ts">
const props = defineProps<{
  infoData: infoSettingType
}>()

import { infoSettingType } from '@/type/data-type'
import { changeDirPath } from '@/utils/analysisFile'

const changeDir = async (path: string, title: string, changeInfo: 'outDir' | 'outPicDir'): Promise<void> => {
  const ans = await changeDirPath(path, title)

  // null やundefinedでなければ書き込む
  if (ans ?? false) {
    props.infoData[changeInfo] = ans
  }
}
</script>

<template>
  <div class="w-full">
    <!-- 動画出力先 -->
    <div class="flex border-b-[1px] border-gray-400 py-2">
      <div class="mr-2 flex w-full justify-between">
        <div title="作成した動画ファイルの出力先" class="flex items-center">動画ファイル出力先</div>
        <button
          class="w-96 truncate rounded-md border border-gray-600 bg-sky-300 px-2 py-1 hover:bg-sky-500"
          :title="infoData.outDir"
          @click="changeDir(infoData.outDir, '動画ファイル出力先', 'outDir')"
        >
          {{ infoData.outDir }}
        </button>
      </div>
    </div>
    <!-- 画面サイズの画像保存先 -->
    <div class="flex border-b-[1px] border-gray-400 py-2">
      <div class="mr-2 flex w-full justify-between">
        <div title="出力動画の画面サイズと同じ大きさに拡大した立ち絵画像ファイル" class="flex items-center">
          画像保存先
        </div>
        <button
          class="w-96 truncate rounded-md border border-gray-600 bg-sky-300 px-2 py-1 hover:bg-sky-500"
          :title="infoData.outPicDir"
          @click="changeDir(infoData.outPicDir, '画像保存先', 'outPicDir')"
        >
          {{ infoData.outPicDir }}
        </button>
      </div>
    </div>
    <!-- 「-」を区切り文字として使うかどうか -->
    <div class="flex border-b-[1px] border-gray-400 py-2">
      <div class="mr-2 flex w-full justify-between">
        <div title="「-」を、音声ファイルの判定処理で区切り文字として使う">区切り文字「-」</div>
        <div class="w-96">
          <input type="checkbox" id="cutHR" v-model="infoData.cutHR" />
        </div>
      </div>
    </div>
  </div>
</template>
