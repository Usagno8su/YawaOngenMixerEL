<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  selectTatieFile: string
  clickEdit: (newFileName: string, index?: number) => void
  fileListTatie: fileListTatieType[]
  defoTatie: fileListTatieType
  editKyaraPicFile: (uuid: string, fileName: string, kyaraName: string, commonsID: string, memo: string) => void
  deleteKyaraPicFile: (uuid: string) => void
  importKyaraPicFile: () => void
  viewFileListTatie: fileListTatieType[]
  selectKyaraName: string | undefined
}>()
// 立ち絵のアップロードと選択を行う画面

import { ref, watch, nextTick } from 'vue'
import type { fileListTatieType } from 'src/type/data-type'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import DisplayTatiePicFile from '@/components/accessories/DisplayTatiePicFile.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import { MakeClassString, FindAllString } from '@/utils/analysisGeneral'
import SearchInputUnit from '@/components/unit/SearchInputUnit.vue'

const refSearchString = ref<{ searchString: string }>({ searchString: undefined })

// 立ち絵が存在するか確認する
const noTatieFile = ref<boolean>(
  props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile) === undefined ? true : false,
)

// 選択中立ち絵の名前とキャラ名を取得
const fileName = ref<string>(
  noTatieFile.value === false
    ? props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile).fileName
    : 'NoName',
)
const kyaraName = ref<string>(
  noTatieFile.value === false
    ? props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile).kyaraName
    : 'NoName',
)

// リストの各項目にrefを設定する
const profileRefs = ref<HTMLDivElement[]>([])
const selectProfileRef = (e: HTMLDivElement) => {
  // 存在するか＆重複があるかかくにんする
  if (e && !profileRefs.value.includes(e)) {
    profileRefs.value.push(e)
  }
}

// 表示後に現在選択中のプロファイル項目を表示するようにスクロールする
nextTick(() => {
  // デフォルト立ち絵以外の場合実行する
  if (props.selectTatieFile !== DEFAULT_KYARA_TATIE_UUID) {
    const selectDiv = props.viewFileListTatie.findIndex((e) => e.uuid === props.selectTatieFile)
    profileRefs.value[selectDiv].scrollIntoView(false)
  }
})

// 立ち絵IDが変わったら取得する表示も変更する
watch(
  () => props.selectTatieFile,
  () => {
    noTatieFile.value =
      props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile) === undefined ? true : false
    fileName.value =
      noTatieFile.value === false
        ? props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile).fileName
        : 'NoName'
    kyaraName.value =
      noTatieFile.value === false
        ? props.viewFileListTatie.find((e) => e.uuid === props.selectTatieFile).kyaraName
        : 'NoName'
  },
)
</script>

<template>
  <div class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center" @click.self="clickClose()">
    <!-- 画面外クリックでクローズ -->
  </div>
  <div class="absolute flex h-96 border border-gray-700 bg-gray-300">
    <div class="overflow-none h-full w-64 border border-gray-700 p-1">
      <div class="h-80 overflow-y-scroll border border-gray-600">
        <SearchInputUnit
          :defaultString="selectKyaraName"
          classSetting="bg-gray-300"
          inputTitle="立ち絵名かキャラ名で検索"
          ref="refSearchString"
        />
        <!-- デフォルト立ち絵は先に表示する -->
        <div class="flex">
          <button
            @click="clickEdit(defoTatie.uuid)"
            :class="
              MakeClassString(
                'mx-1 mt-1 flex h-8 w-full items-center justify-between rounded-md border border-gray-600 p-1',
                'hover:bg-blue-500 hover:text-gray-200',
                selectTatieFile === defoTatie.uuid ? 'bg-blue-400' : 'bg-blue-200',
              )
            "
          >
            <div class="flex w-5/6 items-start truncate pl-1">
              {{ defoTatie.fileName }}
            </div>
          </button>
        </div>
        <!-- デフォルト立ち絵以外を表示する -->
        <div v-for="item in viewFileListTatie" v-bind:key="item.uuid">
          <div
            class="flex"
            v-if="
              item.uuid !== DEFAULT_KYARA_TATIE_UUID &&
              FindAllString(refSearchString.searchString, [item.fileName, item.kyaraName])
            "
          >
            <button
              @click="clickEdit(item.uuid)"
              :class="
                MakeClassString(
                  'mx-1 mt-1 flex h-8 w-full items-center justify-between rounded-md border border-gray-600 p-1',
                  'hover:bg-blue-500 hover:text-gray-200',
                  selectTatieFile === item.uuid ? 'bg-blue-400' : 'bg-blue-200',
                )
              "
              :ref="selectProfileRef"
            >
              <div class="flex w-48 items-start truncate pl-1">
                {{ item.fileName }}
              </div>
              <div v-if="selectTatieFile === item.uuid" class="h-full" @click.stop="deleteKyaraPicFile(item.uuid)">
                <MaterialIcons icon="Delete" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <div>
          <!-- 削除等 -->
        </div>
        <button @click="importKyaraPicFile" title="立ち絵画像の追加" class="h-9 w-9">
          <MaterialIcons icon="AddCircle" />
        </button>
      </div>
    </div>
    <div class="h-full w-60 bg-gray-200">
      <div>
        <div class="mt-1 flex items-center">
          <MaterialIcons icon="PhotoLibrary" titleString="立ち絵の名前" />
          <input
            class="w-2/3"
            v-model="fileName"
            :disabled="selectTatieFile === DEFAULT_KYARA_TATIE_UUID || noTatieFile"
            @keydown.enter="editKyaraPicFile(selectTatieFile, fileName, kyaraName, '', '')"
          />
          <button
            @click.stop="editKyaraPicFile(selectTatieFile, fileName, kyaraName, '', '')"
            :disabled="selectTatieFile === DEFAULT_KYARA_TATIE_UUID || noTatieFile"
          >
            <MaterialIcons icon="Save" titleString="変更を保存" />
          </button>
        </div>
        <div class="flex items-center">
          <MaterialIcons icon="Person" titleString="キャラの名前（後日これを利用する機能を実装予定）" />
          <input
            class="w-2/3"
            v-model="kyaraName"
            :disabled="selectTatieFile === DEFAULT_KYARA_TATIE_UUID || noTatieFile"
            @keydown.enter="editKyaraPicFile(selectTatieFile, fileName, kyaraName, '', '')"
          />
        </div>
      </div>
      <div class="flex items-center justify-center border-t border-gray-700 p-2">
        <div v-if="noTatieFile">立ち絵ファイルが<br />見つかりませんでした</div>
        <DisplayTatiePicFile
          v-else
          :selectTatieFile="selectTatieFile"
          imgClass="max-h-80 max-w-60"
          personOffClass="h-12 w-12"
        />
      </div>
    </div>
  </div>
</template>
