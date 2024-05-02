<script setup lang="ts">
const props = defineProps<{
  enterButtonTitle?: string
  closeDisable?: boolean
  encodeAns: string
  closeEncodeDialog: () => void
}>()

import Dialog from '@/components/accessories/Dialog.vue'
import { ref, watch, nextTick } from 'vue'

const areaRef = ref<HTMLDivElement>()

const message = ref<string[]>(['エンコード開始'])

watch(
  () => props.encodeAns,
  () => {
    const addAns = async (): Promise<void> => {
      message.value.push(props.encodeAns)
    }
    addAns().then(() => {
      nextTick(() => {
        areaRef.value.scrollTop = areaRef.value.scrollHeight
        // 一番下までスクロールする
      })
    })
  },
)
</script>

<template>
  <Dialog
    title="エンコード処理"
    :clickClose="closeEncodeDialog"
    :clickEnter="closeEncodeDialog"
    :enterDisable="closeDisable"
    :closeDisable="closeDisable"
    :showCanselButton="false"
  >
    <div class="h-36 w-96 overflow-y-scroll text-red-500" ref="areaRef">
      <div v-for="(value, index) in message" v-bind:key="index">
        {{ value }}
      </div>
    </div>
  </Dialog>
</template>
