<script setup lang="ts">
const props = defineProps<{
  selectKyara: number
  settype: dataTextType
  dateList: outSettingType[]
  tatieSetting: 'tatieUUID'
  higherUpList: [number, number]
  editName: string
  titleName: string
  fileListTatie: fileListTatieType[]
}>()
import type { dataTextType, outSettingType, fileListTatieType } from 'src/type/data-type'
import { SelectTatieIndexHigherUpData } from '@/utils/analysisData'
import { ref, watch } from 'vue'
import deleteDialogUUID from '@/components/accessories/deleteDialogUUID.vue'
import type { deleteDialogRefType } from 'src/components/accessories/deleteDialogUUID.vue'
import SelectDisplayHigherUpStatus from '@/components/accessories/SelectDisplayHigherUpStatus.vue'
import SelectDisplayTatieFile from '@/components/accessories/SelectDisplayTatieFile.vue'
import { DEFAULT_KYARA_TATIE_UUID } from '@/data/data'
import DisplayTatiePicFile from '@/components/accessories/DisplayTatiePicFile.vue'
const { yomAPI } = window

const isOpenTatieFile = ref<boolean>(false)

const tatieFileRef = ref()

const deleteDialogRef = ref<deleteDialogRefType>({
  deleteMessage: '削除しますか？',
  deleteButtonTitle: '削除',
  deleteTitle: '立ち絵削除',
})
const isDeleteDialogOpen = ref<boolean>(false)
const isDeleteUUID = ref<string>('')

// デフォルトの立ち絵（画像なし）の情報を取得
const defoTatie = ref<fileListTatieType>(props.fileListTatie.find((e) => e.uuid === DEFAULT_KYARA_TATIE_UUID))

// リスト表示のために、名前順に並べた配列を作成する
const viewFileListTatie = ref<fileListTatieType[]>(
  [...props.fileListTatie].sort((x, y) => x.fileName.localeCompare(y.fileName)),
)

// 選択画面の開閉を制御
const setIsOpenTatieFile = (): void => {
  isOpenTatieFile.value = !isOpenTatieFile.value
}

// どの上位設定を使うか決定する
const higherUpEditKyara = ref<number>(
  SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, props.tatieSetting),
)

// 使用する立ち絵のUUIDを変更
// indexの指定がない場合は現在表示中のキャラ設定を変更する
const clickEdit = (newFileName: string, index?: number) => {
  console.log('clickEdit変更処理: ' + newFileName)
  console.log('clickEdit変更処理実行: ' + newFileName)
  if (index !== undefined) {
    props.dateList[index].tatie.tatieUUID.val = newFileName
  } else {
    props.dateList[props.selectKyara].tatie.tatieUUID.val = newFileName
  }
}

// ボタンに表示する立ち絵の名前を選択する
const useTatieName = (): string => {
  if (props.dateList[props.selectKyara].tatie.tatieUUID.active) {
    const ans = props.fileListTatie.find((e) => e.uuid === props.dateList[props.selectKyara].tatie.tatieUUID.val)
    return ans?.fileName ?? defoTatie.value.fileName
  } else {
    const ans = props.fileListTatie.find((e) => e.uuid === props.dateList[higherUpEditKyara.value].tatie.tatieUUID.val)
    return ans?.fileName ?? defoTatie.value.fileName
  }
}

// 立ち絵の画像ファイルをインポートする
const importKyaraPicFile = async (): Promise<void> => {
  const ansFile = yomAPI.opneKyaraPicFileDir()

  // ファイルが読み込まれていれば、その情報を格納する
  if (ansFile.length !== 0) {
    const inFileName = async (): Promise<void> => {
      for (const item of ansFile) {
        props.fileListTatie.push({
          uuid: item.uuid,
          fileName: item.name,
          kyaraName: props.dateList[props.selectKyara].name,
          commonsID: '',
          memo: '',
        })
      }
    }
    inFileName()

    // 立ち絵選択を最初に読み込んだUUIDに変更
    clickEdit(ansFile[0].uuid, props.selectKyara)

    // 名前でソートして表示に渡す
    viewFileListTatie.value = [...props.fileListTatie].sort((x, y) => x.fileName.localeCompare(y.fileName))
  }
}

// 立ち絵につけた名前とキャラ名を変更
const editKyaraPicFile = async (
  uuid: string,
  fileName: string,
  kyaraName: string,
  commonsID: string,
  memo: string,
): Promise<void> => {
  // 変更するキャラのUUIDからindexを取得
  const index = props.fileListTatie.findIndex((e) => e.uuid === uuid)

  // 変更を実施
  props.fileListTatie.splice(index, 1, {
    uuid: uuid,
    fileName: fileName,
    kyaraName: kyaraName,
    commonsID: commonsID,
    memo: memo,
  })
  viewFileListTatie.value = [...props.fileListTatie].sort((x, y) => x.fileName.localeCompare(y.fileName))
}

// 立ち絵の削除（画像は削除していない）
const deleteKyaraPicFile = async (uuid: string): Promise<void> => {
  // 削除するキャラのUUIDからindexを取得
  const index = props.fileListTatie.findIndex((e) => e.uuid === uuid)

  // 他にもおなじ立ち絵が設定されていれば、現在のキャラ設定をデフォルト立ち絵にして、削除はしない
  if (props.dateList.find((e, i) => i !== props.selectKyara && e.tatie.tatieUUID.val === uuid) === undefined) {
    // 削除を実行
    new Promise((resolve) => {
      // 選択中の立ち絵をデフォルトに変更する
      resolve(clickEdit(defoTatie.value.uuid, props.selectKyara))
    })
      .then(() => {
        props.fileListTatie.splice(index, 1)
      })
      .then(() => {
        viewFileListTatie.value = [...props.fileListTatie].sort((x, y) => x.fileName.localeCompare(y.fileName))

        setIsOpenTatieFile()
      })
  } else {
    clickEdit(defoTatie.value.uuid, props.selectKyara)
    setIsOpenTatieFile()
  }
}

//立ち絵削除の確認ダイアログをひらく
const askDeleteKyaraPic = (uuid: string): void => {
  const deleteTatie = props.fileListTatie.find((e) => e.uuid === uuid)
  const deleteMessage = `「${deleteTatie.fileName}」`
  const deleteType =
    props.dateList.find((e, i) => i !== props.selectKyara && e.tatie.tatieUUID.val === uuid) === undefined
      ? 'を削除しますか？'
      : 'をデフォルトに変更しますか？(他でも使用中)'
  console.log('uuid: ' + uuid)
  console.log('なまえ: ' + deleteTatie.fileName)
  deleteDialogRef.value = {
    deleteButtonTitle: '削除',
    deleteTitle: '立ち絵削除',
    deleteMessage: deleteMessage + deleteType,
  }

  new Promise((resolve) => {
    resolve((isDeleteUUID.value = uuid))
  }).then(() => (isDeleteDialogOpen.value = true))
}

// 状態によってボタンのTailwindを変更
const actset = (): string => {
  const setAns = props.dateList[props.selectKyara].tatie.tatieUUID.active
    ? 'hover:bg-blue-600 hover:text-gray-200'
    : 'text-gray-600'
  return 'h-full truncate border border-gray-800 bg-blue-300 px-1' + ' ' + setAns
}

watch(
  () => props.higherUpList,
  () => {
    higherUpEditKyara.value = SelectTatieIndexHigherUpData(props.higherUpList, props.dateList, props.tatieSetting)
  },
)
</script>

<template>
  <div class="flex border-b-[1px] border-gray-400 py-2">
    <div class="mr-2 flex w-full justify-between">
      <!-- 
          ここの設定を使用する場合に入力できる。
          上位設定を使用する場合は表示のみ。
         -->
      <div class="w-2/3">
        <button
          :class="actset()"
          @click="setIsOpenTatieFile"
          :title="'立ち絵: ' + useTatieName()"
          :disabled="!dateList[selectKyara].tatie.tatieUUID.active"
        >
          <DisplayTatiePicFile
            :selectTatieFile="
              dateList[selectKyara].tatie.tatieUUID.active
                ? dateList[selectKyara].tatie.tatieUUID.val
                : dateList[higherUpEditKyara].tatie.tatieUUID.val
            "
            imgClass="h-16"
            personOffClass="h-12 w-12"
          />
        </button>
        <div class="relative" v-if="isOpenTatieFile">
          <SelectDisplayTatieFile
            :clickClose="setIsOpenTatieFile"
            :selectTatieFile="dateList[selectKyara].tatie.tatieUUID.val"
            :clickEdit="clickEdit"
            :fileListTatie="fileListTatie"
            :defoTatie="defoTatie"
            :editKyaraPicFile="editKyaraPicFile"
            :deleteKyaraPicFile="askDeleteKyaraPic"
            :importKyaraPicFile="importKyaraPicFile"
            :viewFileListTatie="viewFileListTatie"
            ref="tatieFileRef"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-center">
      <SelectDisplayHigherUpStatus
        :settype="props.settype"
        :actStatus="dateList[selectKyara].tatie[tatieSetting].active"
        :higherUpType="dateList[higherUpEditKyara].dataType"
        :onClick="
          () =>
            (props.dateList[props.selectKyara].tatie[props.tatieSetting].active =
              !props.dateList[props.selectKyara].tatie[props.tatieSetting].active)
        "
      />
    </div>
  </div>
  <deleteDialogUUID
    :deleteTitle="deleteDialogRef.deleteTitle"
    :clickClose="() => (isDeleteDialogOpen = false)"
    :deleteButtonTitle="deleteDialogRef.deleteButtonTitle"
    :deleteMessage="deleteDialogRef.deleteMessage"
    :clickDelete="deleteKyaraPicFile"
    :uuid="isDeleteUUID"
    v-if="isDeleteDialogOpen"
  />
</template>
