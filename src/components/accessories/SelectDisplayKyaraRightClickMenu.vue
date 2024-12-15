<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  editDataClik: () => void
  askDeleteKyara: () => void
}>()
// キャラ設定のコピーや削除の選択を行う右クリックメニュー

const { yomAPI } = window

// ショートカットキーで名前の変更のコマンドがあった場合は保存を行う
yomAPI.EntEditName(() => {
  props.editDataClik()
})

// ショートカットキーで削除のコマンドがあった場合は保存を行う
yomAPI.EntAskDelete(() => {
  props.askDeleteKyara()
})
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
      @click="console.log('キャラ設定にコピー')"
      class="flex justify-between bg-blue-100 px-2 py-1 text-gray-700 hover:bg-blue-600 hover:text-gray-200"
    >
      <div>キャラ設定にコピー</div>
      <div>Ctrl+E</div>
    </button>
    <button
      @click="console.log('スタイル付きキャラ設定にコピー')"
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
      class="flex justify-between bg-blue-100 px-2 py-1 text-gray-700 hover:bg-blue-600 hover:text-gray-200"
    >
      <div>削除</div>
      <div>Ctrl+D</div>
    </button>
  </div>
</template>
