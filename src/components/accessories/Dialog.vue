<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    clickClose: () => void
    enterButtonTitle?: string
    clickEnter: () => void
    enterDisable?: boolean
    closeDisable?: boolean
    showCanselButton?: boolean
  }>(),
  {
    title: '確認',
    enterButtonTitle: 'クリック',
    showCanselButton: true,
  },
)
</script>

<template>
  <button
    class="fixed right-0 top-0 flex h-screen w-screen items-center justify-center bg-gray-600 bg-opacity-50"
    @click.self="clickClose"
    :disabled="closeDisable"
  >
    <div class="rounded-md border-2 border-gray-800 bg-gray-300 p-3 blur-none">
      <div class="mb-2 ml-2 text-xl font-bold">{{ title }}</div>
      <slot> 実行しますか？ </slot>
      <button class="mt-2 flex items-center justify-center" @click.stop="clickClose" :disabled="closeDisable">
        <button
          v-show="showCanselButton"
          class="cursor-pointer rounded-sm border border-gray-400 px-3 py-1 hover:bg-gray-500 hover:text-gray-100"
        >
          キャンセル
        </button>
        <button
          class="ml-5 cursor-pointer rounded-sm border border-gray-400 bg-red-500 px-3 py-1 text-gray-200 hover:bg-red-600"
          @click="clickEnter"
          :disabled="enterDisable"
        >
          {{ enterButtonTitle }}
        </button>
      </button>
    </div>
  </button>
</template>
