<script setup lang="ts">
const props = defineProps<{
  defaultString?: string
  classSetting?: string
  inputTitle?: string
  deleteTitke?: string
}>()
const emit = defineEmits(['searchKyaraEvent'])
import { ref } from 'vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { MakeClassString } from '@/utils/analysisGeneral'

// 検索文字列が変更されたら、親コンポーネントにも伝える。
const onChange = (text: string): void => {
  emit('searchKyaraEvent', text)
}

const searchString = ref<string>(props.defaultString)

// 検索文字列をすべて削除します。
// searchString.value を空にするだけでなく、
// searchKyaraEventで親コンポーネントにも変更を伝える必要があります。
const deleteString = () => {
  searchString.value = ''
  emit('searchKyaraEvent', '')
}

// searchString を親コンポーネントから呼び出せるようにします
defineExpose({ searchString })
</script>

<template>
  <div :class="MakeClassString(classSetting, 'relative mx-1 mt-1 rounded-2xl border border-gray-600 p-1')">
    <input
      class="ml-1 w-10/12 truncate bg-black/0 outline-none"
      v-model="searchString"
      @input="onChange(searchString)"
      :title="inputTitle ?? '検索文字列を入力'"
    />
    <button class="absolute top-1 right-2" @click="deleteString" :title="deleteTitke ?? '検索文字列を削除'">
      <MaterialIcons icon="Close" />
    </button>
  </div>
</template>
