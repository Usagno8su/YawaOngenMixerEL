<script setup lang="ts">
// 音声ファイル個別の設定のリストを表示し、
// 選択することで切り替えられるようにする。

const props = defineProps<{
  dateList: outSettingType[]
  settype: dataTextType
  selectKyara: number
  dragChangeIndex: number
  KyaraListOrderDragStart: (index: number) => void
  KyaraListOrderDragMove: (index: number) => void
  KyaraListOrderDragEnd: () => void
  setDataTypeClick: (index: number, item: outSettingType) => void
  useSubText: boolean
  subTextStringList: { [key: string]: { val: string; active: boolean } }
  encodeCliek: (index: number) => void
  disableEnterEncode: boolean
}>()

import { outSettingType, dataTextType } from '@/type/data-type'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { MakeClassString } from '@/utils/analysisGeneral'
</script>

<template>
  <div>
    <div
      v-for="(item, index) in dateList"
      v-bind:key="item.uuid"
      :draggable="true"
      @dragstart="() => KyaraListOrderDragStart(index)"
      @dragenter="() => KyaraListOrderDragMove(index)"
      @dragend="() => KyaraListOrderDragEnd()"
      @dragover.prevent
    >
      <div v-if="dragChangeIndex === index" class="h-5 w-5"></div>
      <div
        :class="
          MakeClassString(
            'mx-1 mt-1 flex h-8 items-center justify-between border border-gray-600 p-1 hover:bg-blue-500 hover:text-gray-200',
            props.dateList[props.selectKyara]?.uuid === item.uuid ? 'bg-blue-400' : 'bg-blue-200',
          )
        "
        @click="() => setDataTypeClick(index, item)"
        v-if="item.dataType === 'seid' && item.fileActive"
      >
        <!-- 個々の設定タイプに応じて表示 -->
        <div class="w-3/6 truncate" :title="item.name">{{ item.name }}</div>
        <!-- 設定が有効で、字幕テキストファイルがある場合はその内容を表示 -->
        <div
          class="w-full truncate"
          :title="
            useSubText && subTextStringList[item.uuid].active
              ? subTextStringList[item.uuid].val
              : item.fileName + '.' + item.fileExtension
          "
        >
          {{ useSubText && subTextStringList[item.uuid].active ? subTextStringList[item.uuid].val : item.fileName }}
        </div>
        <button
          class="h-full w-11 rounded-md border border-gray-700 bg-yellow-300"
          v-if="selectKyara === index"
          title="エンコードを実行"
          @click.stop="() => encodeCliek(index)"
          :disabled="disableEnterEncode"
        >
          <MaterialIcons icon="CinematicBlur" classString="mx-1 mh-1" />
        </button>
      </div>
    </div>
  </div>
</template>
