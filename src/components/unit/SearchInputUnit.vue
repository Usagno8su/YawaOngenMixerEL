<script setup lang="ts">
const props = defineProps<{
  defaultString?: string
  classSetting?: string
}>()
import { ref } from 'vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { MakeClassString } from '@/utils/analysisGeneral'

const searchString = ref<string>(props.defaultString)

// 検索文字列をすべて削除します。
const deleteString = () => {
  searchString.value = undefined
}

// searchString を親コンポーネントから呼び出せるようにします
defineExpose({ searchString })
</script>

<template>
  <div :class="MakeClassString(classSetting, 'relative mx-1 mt-1 rounded-2xl border border-gray-600 p-1')">
    <input class="ml-1 w-10/12 truncate outline-none" v-model="searchString" />
    <button class="absolute right-2 top-1" @click="deleteString">
      <MaterialIcons icon="Close" />
    </button>
  </div>
</template>
