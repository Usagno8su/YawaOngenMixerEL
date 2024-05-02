<script setup lang="ts">
const props = defineProps<{
  deleteTitle?: string
  deleteMessage?: string
  clickClose: () => void
  deleteButtonTitle?: string
  uuid?: string
  deleteKyara?: () => void
  deleteProfile?: (uuid: string) => void
}>()

export type deleteDialogRefType = {
  deleteTitle?: string
  deleteMessage?: string
  deleteButtonTitle?: string
}
// tes
</script>

<template>
  <div
    class="fixed right-0 top-0 flex h-screen w-screen items-center justify-center bg-gray-600 bg-opacity-50"
    @click.self="clickClose"
  >
    <div class="flex flex-col items-center rounded-md border-2 border-gray-800 bg-gray-300 p-6 blur-none">
      <div>{{ deleteTitle || '削除確認' }}</div>
      <div class="mt-2">{{ deleteMessage || '削除しますか？' }}</div>
      <div class="mt-2 flex items-center justify-between" @click="clickClose">
        <div class="cursor-pointer rounded-sm border border-gray-400 px-3 py-1 hover:bg-gray-500 hover:text-gray-100">
          キャンセル
        </div>
        <div
          class="ml-5 cursor-pointer rounded-sm border border-gray-400 bg-red-500 px-3 py-1 text-gray-200 hover:bg-red-600"
          @click="deleteKyara ?? deleteProfile(uuid)"
        >
          {{ deleteButtonTitle || '削除' }}
        </div>
      </div>
    </div>
  </div>
</template>
