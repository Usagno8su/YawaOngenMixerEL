<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  higherUpList: [number, number]
  fileListTatie: fileListTatieType[]
  inputProfileUUID: string
  tatieOrderList: tatieOrderListType[]
  isFileTatieOrderSetting: boolean
  subTextStringList: { [key: string]: { val: string; active: boolean } }
  useSubText: boolean
  TatieOrderDragStart: (index: number) => void
  TatieOrderDragMove: (index: number) => void
  TatieOrderNew: () => void
  TatieOrderChange: (uuid: string, outSetting: outSettingType) => void
  TatieOrderDel: (index: number) => void
  TatieOrderChangeSituation: (index: number) => void
  CopyTatieOrderListToFileList: (index: number) => void
}>()
// 複数の立ち絵の表示順番を設定します。

import type { dataTextType, outSettingType, fileListTatieType, tatieOrderListType } from 'src/type/data-type'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { typeColor } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'
import deleteDialog from '@/components/accessories/deleteDialog.vue'
import SelectDisplayTatieOrderKyara from '@/components/accessories/SelectDisplayTatieOrderKyara.vue'
import { ref } from 'vue'

const isDeleteDialogOpen = ref<boolean>(false)

const isDeleteIndex = ref<number>()

// キャラ設定の選択を行う画面を表示させるための変数
const isSelectDisplayTatieOrderKyaraOpen = ref<boolean>(false)
const selectTatieOrderListUUID = ref<string>()
const selectDataType = ref<dataTextType>('defo')
const selectKyaraName = ref<string>()
const selectKyaraStyle = ref<string>()

const AskDelete = (index: number): void => {
  isDeleteIndex.value = index
  isDeleteDialogOpen.value = true
}

// キャラ設定の選択を行う画面を表示する
const OpenSelectDisplayTatieOrderKyara = (uuid: string, name: string, style?: string): void => {
  selectTatieOrderListUUID.value = uuid
  selectKyaraName.value = name
  selectKyaraStyle.value = style
  isSelectDisplayTatieOrderKyaraOpen.value = true
}
</script>

<template>
  <div class="h-full w-full">
    <div class="relative flex h-5/6 w-full flex-col items-center overflow-y-scroll border border-gray-500 px-2 py-1">
      <div
        class="mt-1 flex w-[580px] justify-between rounded-xl border border-black"
        v-for="(item, index) in tatieOrderList"
        v-bind:key="item.uuid"
        :draggable="true"
        @dragstart="() => TatieOrderDragStart(index)"
        @dragenter="() => TatieOrderDragMove(index)"
      >
        <div class="flex truncate">
          <div class="my-1 ml-2 rounded-3xl border border-black px-2">{{ index }}</div>
          <button
            :class="
              MakeClassString(
                'my-1 ml-1 flex items-center rounded-3xl border border-black px-2',
                typeColor[item.dataType].bg,
              )
            "
            :title="item.name + (item.dataType === 'kyast' ? '（' + item.kyaraStyle + '）' : '')"
            @click="() => OpenSelectDisplayTatieOrderKyara(item.uuid, item.name, item.kyaraStyle)"
          >
            <div class="max-w-52 truncate">{{ item.name }}</div>
            <div class="max-w-40 truncate" v-if="item.dataType === 'kyast'">
              {{ '（' + item.kyaraStyle + '）' }}
            </div>
          </button>
          <MaterialIcons classString="w-5" icon="ArrowForward400024" />
          <button
            class="my-1 ml-1 rounded-3xl border border-black px-2"
            @click="() => TatieOrderChangeSituation(index)"
            title="クリックで設定変更します"
          >
            {{ item.tatieSituation === 'waitTatieUUID' ? '待機中' : '会話中' }}
          </button>
        </div>
        <button @click="() => AskDelete(index)" title="リストから削除" class="h-9 w-9 p-1">
          <MaterialIcons icon="Delete" />
        </button>
      </div>
      <!-- 表示のみの場合は上にかぶせて操作できないようにする -->
      <div
        class="absolute h-full w-full bg-gray-600/40"
        v-if="!(props.settype === 'tatieOrder' || isFileTatieOrderSetting)"
      ></div>
    </div>
    <div class="mt-1 flex justify-between px-2">
      <div>
        <button
          @click="
            () => (dateList[selectKyara].fileTatieOrderList.active = !dateList[selectKyara].fileTatieOrderList.active)
          "
          :title="
            dateList[selectKyara].fileTatieOrderList.active
              ? '個別の立ち絵配置設定を無効化'
              : '個別の立ち絵配置設定を有効化'
          "
          class="h-9 w-9 rounded-md border border-black"
          v-if="settype === 'seid'"
        >
          <MaterialIcons
            :icon="dateList[selectKyara].fileTatieOrderList.active ? 'RadioButtonChecked' : 'RadioButtonUnchecked'"
          />
        </button>
      </div>
      <div>
        <button
          @click="CopyTatieOrderListToFileList(selectKyara)"
          title="プロファイルの立ち絵配置をコピーします"
          class="mr-2 h-9 w-9 rounded-md border border-black"
          v-if="settype === 'seid'"
          :disabled="dateList[selectKyara].fileTatieOrderList.active === false"
        >
          <MaterialIcons
            :classString="dateList[selectKyara].fileTatieOrderList.active === false ? 'opacity-50' : ''"
            icon="PhotoLibrary"
          />
        </button>
        <button
          @click="() => TatieOrderNew()"
          title="立ち絵が設定されているキャラ設定の追加（立ち絵が設定されているものが優先的に追加されます）"
          class="h-9 w-9 rounded-md border border-black"
        >
          <MaterialIcons icon="AddCircle" />
        </button>
      </div>
    </div>
    <SelectDisplayTatieOrderKyara
      :clickClose="() => (isSelectDisplayTatieOrderKyaraOpen = false)"
      :TatieOrderChange="TatieOrderChange"
      :dateList="dateList"
      :selectTatieOrderListUUID="selectTatieOrderListUUID"
      :selectDataType="selectDataType"
      :selectKyaraName="selectKyaraName"
      :selectKyaraStyle="selectKyaraStyle"
      :subTextStringList="subTextStringList"
      :useSubText="useSubText"
      :settype="settype"
      v-if="isSelectDisplayTatieOrderKyaraOpen"
    />
    <deleteDialog
      :deleteTitle="'リストから削除'"
      :clickClose="() => (isDeleteDialogOpen = false)"
      :deleteButtonTitle="'削除'"
      :deleteMessage="'この立ち絵を表示順リストから削除しますか？'"
      :deleteKyara="() => TatieOrderDel(isDeleteIndex)"
      v-if="isDeleteDialogOpen"
    />
  </div>
</template>
