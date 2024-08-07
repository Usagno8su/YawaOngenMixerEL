<script setup lang="ts">
const props = defineProps<{
  settype: dataTextType
  setTypeChange: (set: dataTextType) => void
  setChangeDataSettingSta: (sta: boolean) => void
}>()

import setTatie from '@/components/setTatie.vue'
import setSubtitle from '@/components/setSubtitle.vue'
import setMainInfo from '@/components/setMainInfo.vue'
import setKyaraList from '@/components/setKyaraList.vue'
import type {
  tatieSetting,
  beforeKyaraSelectType,
  selectedEditDataType,
  outSettingType,
  dataTextType,
  inputProfileSendReType,
  infoSettingType,
  fileListTatieType,
} from 'src/type/data-type'
import {
  analysisFileName,
  writeProfilleSettingData,
  writeVoiceFileSettingData,
  writeFileListKyaraData,
  readFileListTatieData,
  enterEncodeVideoFile,
} from '@/utils/analysisFile'
import {
  createNewDataID,
  createNewDateList,
  SelectHigherUpIndexList,
  createVoiceFileEncodeSetting,
  getGlobalSetting,
  loadProfile,
  writeGlobalSetting,
  getPlatform,
} from '@/utils/analysisData'
import { DEFAULT_KYARA_SETTING_UUID } from '@/data/data'
import { createDefoKyaraDateList } from '@/utils/analysisGeneral'
import type { deleteDialogRefType } from 'src/components/accessories/deleteDialog.vue'
import deleteDialog from '@/components/accessories/deleteDialog.vue'
import DisplaySelectFileView from '@/components/accessories/DisplaySelectFileView.vue'
import DisplaySettingSampleView from '@/components/accessories/DisplaySettingSampleView.vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import DisplayHigherUpKyaraSettingView from '@/components/accessories/DisplayHigherUpKyaraSettingView.vue'
import DialogEncode from '@/components/unit/DialogEncode.vue'

import { ref, watch } from 'vue'

// デフォルトのキャラ設定プロファイルを読み込む
const { yomAPI } = window

// 全体設定の読み込み
const globalSetting = getGlobalSetting()

// 読み込む設定プロファイル番号を指定する。（拡張子「.json」は含めいないこと）
const inputProfileUUID = ref<string>(globalSetting.selectProfile)

// JSONファイル読み込み
const inputProfileData = <inputProfileSendReType>loadProfile(inputProfileUUID.value)
const dateList = ref<outSettingType[]>(inputProfileData.settingList)
const infoData = ref<infoSettingType>(inputProfileData.infoSetting)

// 立ち絵UUID情報の読み込み
const fileListTatie = ref<fileListTatieType[]>(readFileListTatieData())

// 音声ファイルを読み込んだディレクトリのパス
const voiceLoadDirPath = ref<string>('')

// 読み込んだキャラ設定データが空の場合はデフォルトデータだけを入れる
if (dateList.value.length === 0) {
  dateList.value.push(createDefoKyaraDateList(getPlatform()))
}

// ファイルリストのテストデータを追加する
//dateList.value.push(...analysisFileName(['wav', 'ogg'], true, '/home/ubuntu/vivo1/YOM解説/動画用音声/解説動画２'))
console.table(dateList.value)

// 表示切り替え時に前にどれを表示していたか記録
const beforeKyaraSelect = ref<beforeKyaraSelectType[]>([])

// ボタンクリックで設定タイプを切り替え
const editData = ref<selectedEditDataType>('tatie')
const setClick = (editSet: selectedEditDataType) => {
  editData.value = editSet
}

// 現在選択中の項目
// dateListのindex番号となる
const selectKyara = ref<number>(0)

// 選択中のキャラ設定の上位設定がどれか格納
const higherUpList = ref<[number, number]>(SelectHigherUpIndexList(props.settype, dateList.value, selectKyara.value))

// エンコードできないときに、ボタンを無効化する変数
const disableEnterEncode = ref<boolean>(true)

// エンコードダイアログの表示を行う
const isEncodeOpen = ref<boolean>(false)

// エンコード結果の表示を行う
const encodeAns = ref<string>('')

// setKyaraListの関数を利用するためのRef
const setKyaraListRef = ref(null)

// エンコードダイアログを閉じる
const closeEncodeDialog = (): void => {
  isEncodeOpen.value = false
  disableEnterEncode.value = false
  encodeAns.value = ''
}

// 選択中のボタンの場合は背景色を変更する
const actset = (editSet: selectedEditDataType): string => {
  return (
    'mr-2 p-1 border rounded-sm border-black' +
    ' ' +
    (editData.value === editSet
      ? 'bg-blue-400 hover:bg-blue-500 hover:text-gray-200'
      : 'bg-blue-200 hover:bg-blue-500 hover:text-gray-200')
  )
}

// キャラや音声IDのクリックでselectKyaraを変更する。
const setDataTypeClick = (index: number, selectItem: outSettingType): void => {
  console.log('クリックアイテム: ' + selectItem.name)
  selectKyara.value = index
  higherUpList.value = SelectHigherUpIndexList(props.settype, dateList.value, index)
}

// キャラ設定を追加
const addNewKyara = (dataType: dataTextType, kyaraName: string, kyaraStyle: string | undefined): boolean => {
  try {
    // 同じキャラ設定がない場合は追加する。
    if (
      dateList.value.find((e) => e.name === kyaraName && e.dataType === dataType && e.kyaraStyle === kyaraStyle) ===
      undefined
    ) {
      console.log('追加')
      dateList.value.push(
        createNewDateList(
          dataType,
          yomAPI.getUUID(),
          kyaraName,
          kyaraStyle,
          {},
          {},
          undefined,
          undefined,
          undefined,
          yomAPI.getPlatformData(),
        ),
      )
    } else {
      console.log('重複があるためキャンセル')
      throw new Error('重複があります')
    }
  } catch (e) {
    // something wrong
    console.log('キャラ設定エラー')
    return false
  }

  // 追加した要素を選択状態にする
  selectKyara.value = dateList.value.length - 1
  console.log('現在編集中のキャラ設定: ' + dateList.value[selectKyara.value].name)

  return true
}

const deleteDialogRef = ref<deleteDialogRefType>({
  deleteMessage: '削除しますか？',
  deleteButtonTitle: '削除',
  deleteTitle: ' キャラ削除',
})
const isDeleteDialogOpen = ref<boolean>(false)

// キャラ設定項目を削除
//
// 削除前に選択中の項目を他の削除されない項目に変更する。
//  dateList.value[selectKyara.value] が存在しない値になる場合があるので、他で表示しないように例外処理する
const deleteKyara = (): void => {
  console.log('削除起動:' + selectKyara.value)

  const deleteIndexData = selectKyara.value

  // 次に表示するキャラのUUIDを探す
  const nextSelectKyaraID = ref<string>()
  try {
    nextSelectKyaraID.value = dateList.value.find((e, i) => i !== deleteIndexData && e.dataType === props.settype).uuid
  } catch (e) {
    nextSelectKyaraID.value = DEFAULT_KYARA_SETTING_UUID
  }

  // dateList.value[selectKyara.value] をいったん0を指すようにする。
  selectKyara.value = 0

  // 削除を実行
  dateList.value.splice(deleteIndexData, 1)

  // 記録したキャラIDから新しいキャラ設定のindex値を探す
  selectKyara.value = dateList.value.findIndex((e) => e.uuid === nextSelectKyaraID.value)
}

//キャラ削除の確認ダイアログをひらく
const askDeleteKyara = (): void => {
  console.log('削除キャラ: ' + dateList.value[selectKyara.value].name)
  deleteDialogRef.value = {
    ...deleteDialogRef.value,
    deleteMessage:
      dateList.value[selectKyara.value].name +
      (dateList.value[selectKyara.value].dataType === 'kyast'
        ? '（' + dateList.value[selectKyara.value].kyaraStyle + '）'
        : '') +
      'を削除しますか？',
  }
  // deleteIndex.value = index
  isDeleteDialogOpen.value = true
}

// フォルダの選択画面の表示して、
// 指定されたフォルダの音声ファイルを表示する。
const loadVoiceDirList = (): void => {
  // 音声ファイルのリストとそれらがあるディレクトリのパスを取得
  const [ans, dir] = analysisFileName(['wav', 'ogg'], true, voiceLoadDirPath.value ?? undefined)

  //
  if (ans.length !== 0) {
    voiceLoadDirPath.value = dir
    const tempbuf = [...dateList.value]

    // dateList.value[selectKyara.value] をいったん0を指すようにする。
    selectKyara.value = 0

    dateList.value = tempbuf.filter((item) => item.dataType !== 'seid')

    dateList.value.push(...ans)
    console.table(dateList.value)
    // 記録したキャラIDから新しいキャラ設定のindex値を探す
    selectKyara.value = dateList.value.findIndex((e) => e.dataType === props.settype)

    // エンコードボタンを押せるようにする
    disableEnterEncode.value = false
  } else {
    // 該当ファイルがない場合は、エンコードボタンを押せないようにする
    disableEnterEncode.value = true
  }
}

// キャラ設定プロファイルを作成する。
// copyUuidがtrue場合は、新しいUUID名で現在のdateList.valueの情報から作成
// falesの場合は初期データから新規に作成する。
const createProfileData = async (copyUuid: boolean): Promise<string> => {
  const uuid = yomAPI.getUUID()

  if (copyUuid) {
    // キャラ設定プロファイルの書き込み
    const ans = writeProfilleSettingData(
      uuid,
      infoData.value,
      dateList.value.filter((item) => item.dataType !== 'seid'),
    )
    return uuid
  } else {
    const ans = yomAPI.writeKyaraProfileData(uuid)
    return uuid
  }
}

// 現在表示中のプロファイルを保存します
const writeSettingData = (): void => {
  // それぞれのファイル用のデータを抽出
  const settingListDate = dateList.value.filter((item) => item.dataType !== 'seid') // プロファイル
  const voiceDirData = dateList.value.filter((item) => item.dataType === 'seid') // 音声ファイルのあるディレクトリ

  // キャラ設定プロファイルの書き込み
  const ans = writeProfilleSettingData(inputProfileUUID.value, infoData.value, settingListDate)

  // 音声ファイルディレクトリを読み込んでいれば記録する
  let ans2 = true
  if (voiceLoadDirPath.value !== '' && voiceDirData.length !== 0) {
    ans2 = writeVoiceFileSettingData(voiceLoadDirPath.value, voiceDirData)
  }

  const ans3 = writeFileListKyaraData(fileListTatie.value)

  console.log('書き込み結果: ' + ans + ans2)

  props.setChangeDataSettingSta(false)
}

// writeProfileData を親コンポーネントから呼び出せるようにします
defineExpose({ writeSettingData })

// ショートカットキーで設定保存のコマンドがあった場合は保存を行う
yomAPI.entSaveSetting(() => {
  writeSettingData()
})

// エンコード画面を開く
const entOpen = (): void => {
  isEncodeOpen.value = true
  disableEnterEncode.value = true
}

// エンコードをを実施して、結果を変数に入力する。
const encodeAndDisplay = async (index: number): Promise<void> => {
  await enterEncodeVideoFile(
    voiceLoadDirPath.value,
    createVoiceFileEncodeSetting(dateList.value[index], index, dateList.value, infoData.value),
  )
  encodeAns.value = 'エンコード完了: ' + dateList.value[index].fileName
}

// 選択中の音声ファイルの変換を実施
const encodeCliek = async (index: number): Promise<void> => {
  entOpen()

  await encodeAndDisplay(index)

  // ダイアログを閉じれるようにする
  disableEnterEncode.value = false
}

// すべての音声ファイルの変換を実施
const encodeAllCliek = async (): Promise<void> => {
  entOpen()

  new Promise((resolve) => {
    // それぞれの音声ファイル設定を抽出
    resolve(dateList.value.filter((item) => item.dataType === 'seid'))
  })
    .then(async (voiceDirData: outSettingType[]) => {
      // それぞれ変換を実施
      for await (const e of voiceDirData) {
        await encodeAndDisplay(dateList.value.findIndex((x) => x.uuid === e.uuid))
      }
    })
    .finally(() => {
      encodeAns.value = 'エンコード全完了'

      // ダイアログを閉じれるようにする
      disableEnterEncode.value = false
    })
}

// 指定されたUUIDからのキャラ設定プロファイルに切り替える
const onChangeKyaraProfile = (uuid: string): void => {
  // 指定されたUUIDのJSONファイル読み込み
  const profile = <inputProfileSendReType>loadProfile(uuid)
  dateList.value = profile.settingList
  infoData.value = profile.infoSetting
  inputProfileUUID.value = uuid

  // 起動時に開くプロファイルを変更する。
  writeGlobalSetting({ ...globalSetting, selectProfile: uuid })
}

// 設定タイプを切り替え(settype)があったら現在編集中のキャラ設定を変える。
watch(
  () => props.settype,
  () => {
    //// 表示変更前に現在の選択状態を記録する
    // すでに過去の記録があれば（-1以外）それを入れ替え、なければ追記
    const beforeSelect = beforeKyaraSelect.value.findIndex((e) => e.selectedKyaraIndex === selectKyara.value)

    // なお、選択されていない場合は記録しない
    if (dateList.value[selectKyara.value]?.dataType !== undefined) {
      if (beforeSelect === -1) {
        beforeKyaraSelect.value.push({
          selectedEditData: editData.value,
          selectedKyaraIndex: selectKyara.value,
        })
      } else {
        beforeKyaraSelect.value.splice(beforeSelect, 1, {
          selectedEditData: editData.value,
          selectedKyaraIndex: selectKyara.value,
        })
      }
    }

    //// 設定タイプを切り替えたときに、どのキャラ設定を選択するか決める。
    // 以前に開いた記録があるか確認し、あればそれに変更(立ち絵か字幕かの設定タイプ含めて)、なければ一番最初の要素を開く
    //
    // ただし、過去に開いていた項目が削除されている場合は、別のものを選択するか、未選択状態にする。
    const afterSelect = beforeKyaraSelect.value.find(
      (e) => dateList.value[e.selectedKyaraIndex]?.dataType === props.settype,
    )
    if (afterSelect === undefined) {
      // dateList.value[selectKyara.value] が、一瞬でも存在しない値を指すとエラーになるので、いったん別の変数に入れる
      // const newSelextKyaraIndex = dateList.value.findIndex((e) => e.dataType === props.settype)
      selectKyara.value = dateList.value.findIndex((e) => e.dataType === props.settype)
      editData.value = 'tatie'
    } else {
      editData.value = afterSelect.selectedEditData
      selectKyara.value = afterSelect.selectedKyaraIndex
      higherUpList.value = SelectHigherUpIndexList(props.settype, dateList.value, afterSelect.selectedKyaraIndex)
    }
  },
)

// 現在編集中のキャラ設定が変更された場合、表示内容を変える。
watch(
  () => selectKyara.value,
  () => {
    // 選択中のキャラ設定の上位設定がどれか格納
    if (dateList.value[selectKyara.value] !== undefined) {
      higherUpList.value = SelectHigherUpIndexList(props.settype, dateList.value, selectKyara.value)
    }
  },
)

// 設定に編集があったときにはtrueを入れる
watch(
  () => dateList.value,
  () => {
    props.setChangeDataSettingSta(true)
  },
  { deep: true },
)

// キャラUUIDリストに変更があったときは自動保存
watch(
  () => fileListTatie.value,
  () => {
    writeFileListKyaraData(fileListTatie.value)
  },
  { deep: true },
)
</script>

<template>
  <div class="flex">
    <div class="mx-1">
      <DisplaySettingSampleView
        :dateList="dateList"
        :higherUpList="higherUpList"
        :selectKyara="selectKyara"
        :infoData="infoData"
        :onSampleView="dateList[selectKyara] !== undefined"
      />
      <setKyaraList
        :dateList="dateList"
        :settype="settype"
        :setDataTypeClick="setDataTypeClick"
        :addNewKyara="addNewKyara"
        :askDeleteKyara="askDeleteKyara"
        :selectKyara="selectKyara"
        :encodeCliek="encodeCliek"
        :entOpen="entOpen"
        :disableEnterEncode="disableEnterEncode"
        :onChangeKyaraProfile="onChangeKyaraProfile"
        :inputProfileUUID="inputProfileUUID"
        :createProfileData="createProfileData"
        ref="setKyaraListRef"
      />
      <!-- キャラ設定プロファイルの追加ボタンは、defoでのみ表示 -->
      <div v-if="settype === 'defo'" class="my-2 ml-1 flex items-center justify-end">
        <button
          class="rounded-md border border-gray-800 p-1"
          title="プロファイルの新規作成"
          @click="setKyaraListRef.selectProfileListRef.newProfile(false)"
        >
          <MaterialIcons icon="AddPhotoAlternate" />
        </button>
      </div>
      <!-- 音声ファイルの読み込みと変換のボタンは、ファイル個別設定でのみ表示 -->
      <div v-if="settype === 'seid'" class="my-2 ml-1 flex items-center justify-between">
        <button class="rounded-md border border-gray-800 p-1" title="フォルダ読み込み" @click="loadVoiceDirList()">
          <MaterialIcons icon="FolderOpen" classString="" />
        </button>
        <button
          class="ml-1 rounded-md border border-gray-800 bg-red-500 p-1"
          title="すべての音声ファイルの変換を開始"
          @click="encodeAllCliek()"
          :disabled="disableEnterEncode"
        >
          <MaterialIcons icon="InterpreterMode" classString="" />
        </button>
      </div>
    </div>
    <div class="w-full">
      <div class="flex h-9 justify-between">
        <div>
          <DisplayHigherUpKyaraSettingView
            v-if="settype !== 'defo'"
            :settype="settype"
            :dateList="dateList"
            :higherUpList="higherUpList"
          />
        </div>
        <div>
          <!-- 基本設定はデフォルト設定でのみ表示 -->
          <button :class="actset('defo')" @click="setClick('defo')" v-if="settype === 'defo'">基本</button>
          <button :class="actset('tatie')" @click="setClick('tatie')">立ち絵</button>
          <button :class="actset('subtitle')" @click="setClick('subtitle')">字幕</button>
        </div>
      </div>
      <div class="h-[610px] rounded-md border-2 bg-gray-200 p-2">
        <div class="my-2 flex h-7 justify-between border-b-[1px] border-gray-400">
          <div class="mr-3 flex w-[30rem] items-center overflow-hidden truncate border-r-[1px] border-gray-400 pr-1">
            <DisplaySelectFileView
              :selectKyara="selectKyara"
              :dateList="dateList"
              v-if="dateList[selectKyara] !== undefined"
            />
          </div>
          <div v-if="settype !== 'defo'" class="flex w-5 items-center">
            <MaterialIcons icon="InstantMixWght600" titleString="ここの設定を使用" />
          </div>
        </div>
        <setMainInfo :infoData="infoData" v-if="editData === 'defo' && settype === 'defo'" />
        <setTatie
          :selectKyara="selectKyara"
          :dateList="dateList"
          :settype="settype"
          :higherUpList="higherUpList"
          :fileListTatie="fileListTatie"
          v-else-if="editData === 'tatie' && dateList[selectKyara] !== undefined"
        />
        <setSubtitle
          :selectKyara="selectKyara"
          :dateList="dateList"
          :settype="settype"
          :higherUpList="higherUpList"
          v-else-if="editData === 'subtitle' && dateList[selectKyara] !== undefined"
        />
        <div v-else>項目が作成されていません。</div>
      </div>
    </div>
    <deleteDialog
      :deleteTitle="deleteDialogRef.deleteTitle"
      :clickClose="() => (isDeleteDialogOpen = false)"
      :deleteButtonTitle="deleteDialogRef.deleteButtonTitle"
      :deleteMessage="deleteDialogRef.deleteMessage"
      :deleteKyara="deleteKyara"
      v-if="isDeleteDialogOpen"
    />
    <DialogEncode
      v-if="isEncodeOpen"
      :encodeAns="encodeAns"
      :closeEncodeDialog="closeEncodeDialog"
      :closeDisable="disableEnterEncode"
    />
  </div>
</template>
