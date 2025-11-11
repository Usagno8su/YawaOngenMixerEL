<script setup lang="ts">
const props = defineProps<{
  clickClose: (bgColor: string) => void
  RawEncodeTatie: () => void
  RawSaveTatie: () => Promise<void>
  reversedtatieOrderList: tatieOrderListType[]
  refDisplayRawView: { [key: string]: InstanceType<typeof DisplaySampleView> | null }
  tatieBgColor: string
  showOrderList: boolean
}>()
// 加工済み立ち絵画像を拡大表示する（本来の大きさでエンコードする）

import type { tatieOrderListType } from '@/type/data-type'
import { ref } from 'vue'
import DisplaySampleView from '@/components/accessories/DisplaySampleView.vue'

const tatieBgColor = ref<string>(props.tatieBgColor)

// コンポーネントが表示して0.1秒後に立ち絵のエンコードと表示を実行
setTimeout(() => props.RawEncodeTatie(), 1000)
</script>

<template>
  <div
    class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center bg-gray-600/30"
    @click.stop="clickClose(tatieBgColor)"
  >
    <!-- 画面外クリックでクローズ -->
  </div>
  <div
    class="fixed top-10 right-0 z-50 flex w-screen items-center justify-center bg-black/60"
    @click.stop="() => clickClose(tatieBgColor)"
  >
    <!-- 画面クリックでクローズ -->
    <div>
      <div class="flex justify-start bg-gray-300/25">
        <button
          @click="() => RawSaveTatie()"
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
      <div class="my-2 h-[600px]" :style="'background-color:' + tatieBgColor">
        <div class="relative h-[600px] w-screen">
          <div v-if="showOrderList">
            <div v-for="item in reversedtatieOrderList" :key="item.uuid">
              <DisplaySampleView
                :ref="(el) => (refDisplayRawView[item.uuid] = el as InstanceType<typeof DisplaySampleView> | null)"
                imgClass="max-h-[600px] w-screen"
              />
            </div>
          </div>
          <div v-else>
            <DisplaySampleView
              :ref="(el) => (refDisplayRawView.refSingle = el as InstanceType<typeof DisplaySampleView> | null)"
              imgClass="max-h-[600px] w-screen"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
