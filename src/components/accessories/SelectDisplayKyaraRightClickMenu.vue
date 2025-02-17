<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  CopyKyaraSetting: (settype: dataTextType) => void
  editDataClik: () => void
  askDeleteKyara: () => void
  checkIntoTatieOrderList: () => boolean
}>()
// キャラ設定のコピーや削除の選択を行う右クリックメニュー
import { dataTextType } from '@/type/data-type'
import { MakeClassString } from '@/utils/analysisGeneral'
</script>

<template>
  <div
    class="fixed right-0 top-0 flex h-screen w-screen items-center justify-center bg-gray-600 bg-opacity-30"
    @click.self="clickClose"
  >
    <!-- 画面外クリックでクローズ -->
  </div>
  <div
    class="border-1 fixed top-1/3 flex w-96 flex-col rounded-3xl border-gray-800 bg-blue-100 px-5 py-4 text-sm"
    @click.stop="clickClose"
  >
    <button
      @click="CopyKyaraSetting('kyara')"
      class="flex justify-between bg-blue-100 px-2 py-1 text-gray-700 hover:bg-blue-600 hover:text-gray-200"
    >
      <div>キャラ設定にコピー</div>
      <div>Ctrl+E</div>
    </button>
    <button
      @click="CopyKyaraSetting('kyast')"
      class="flex justify-between bg-blue-100 px-2 py-1 text-gray-700 hover:bg-blue-600 hover:text-gray-200"
    >
      <div>スタイル付きキャラ設定にコピー</div>
      <div>Ctrl+R</div>
    </button>
    <button
      @click="editDataClik()"
      class="flex justify-between bg-blue-100 px-2 py-1 text-gray-700 hover:bg-blue-600 hover:text-gray-200"
    >
      <div>名前の変更</div>
      <div>Ctrl+Space</div>
    </button>
    <button
      @click="askDeleteKyara()"
      :class="
        MakeClassString(
          'flex justify-between px-2 py-1',
          checkIntoTatieOrderList()
            ? 'bg-gray-200 text-gray-500'
            : 'bg-blue-100 text-gray-700 hover:bg-blue-600 hover:text-gray-200',
        )
      "
      :title="checkIntoTatieOrderList() ? 'プロファイルの「立ち絵順序の設定」に入っている場合は削除できません。' : ''"
      :disabled="checkIntoTatieOrderList()"
    >
      <div>削除</div>
      <div>Ctrl+D</div>
    </button>
  </div>
</template>
