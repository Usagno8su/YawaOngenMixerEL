<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
  fileListTatie: fileListTatieType[]
  inputProfileUUID: string
  tatieOrderList: tatieOrderListType[]
  TatieOrderDragStart: (index: number) => void
  TatieOrderDragMove: (index: number) => void
  TatieOrderNew: () => void
}>()
// 複数の立ち絵の表示順番を設定します。

import type { dataTextType, outSettingType, fileListTatieType, tatieOrderListType } from 'src/type/data-type'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { typeColor } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'
</script>

<template>
  <div class="h-full w-full">
    <div class="flex h-full w-full flex-col items-center overflow-y-scroll border border-gray-500 px-2 py-1">
      <div
        class="mt-1 flex w-[580px] truncate rounded-xl border border-black"
        v-for="(item, index) in tatieOrderList"
        v-bind:key="item.uuid"
        :draggable="true"
        @dragstart="() => TatieOrderDragStart(index)"
        @dragenter="() => TatieOrderDragMove(index)"
      >
        <div class="my-1 ml-1 rounded-3xl border border-black px-2">{{ index }}</div>
        <div
          :class="
            MakeClassString(
              'my-1 ml-1 flex items-center rounded-3xl border border-black px-2',
              typeColor[item.dataType].bg,
            )
          "
          :title="item.name + (item.dataType === 'kyast' ? '（' + item.kyaraStyle + '）' : '')"
        >
          <div class="max-w-52 truncate">{{ item.name }}</div>
          <div class="max-w-40 truncate" v-if="item.dataType === 'kyast'">
            {{ '（' + item.kyaraStyle + '）' }}
          </div>
        </div>
        <MaterialIcons classString="w-5" icon="ArrowForward400024" />
        <div class="my-1 ml-1 rounded-3xl border border-black px-2">
          {{ item.tatieSituation === 'waitTatieUUID' ? '待機中' : '会話中' }}
        </div>
      </div>
    </div>
    <div class="mt-1 flex justify-end px-2">
      <button
        @click="() => TatieOrderNew()"
        title="立ち絵が設定されているキャラ設定の追加（立ち絵が設定されていないと追加できません）"
        class="h-9 w-9"
      >
        <MaterialIcons icon="AddCircle" />
      </button>
    </div>
  </div>
</template>
