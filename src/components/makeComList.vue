<script setup lang="ts">
const props = defineProps<{
  settype: dataTextType
  setTypeChange: (set: dataTextType) => void
  setChangeDataSettingSta: (sta: boolean) => void
}>()

import setTatie from '@/components/setTatie.vue'
import setSubtitle from '@/components/setSubtitle.vue'
import setMainInfo from '@/components/setMainInfo.vue'
import setTatieOrder from '@/components/setTatieOrder.vue'
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
  tatieOrderListType,
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
  getGlobalSetting,
  loadProfile,
  writeGlobalSetting,
  getPlatform,
  FindAllString,
  CreateCopyDateList,
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
const tatieOrderList = ref<tatieOrderListType[]>(inputProfileData.tatieOrderList)

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

// 音声ファイルのUUIDのをキーにした字幕テキストファイルの内容を記録したファイル
const subTextStringList = ref<{ [key: string]: { val: string; active: boolean } }>({})

// setKyaraListの関数を利用するためのRef
const setKyaraListRef = ref(null)

// 立ち絵の表示順をマウスで入れ替えるため、
// 移動開始時の数値を保存する変数
const dragStartIndex = ref<number>()

const refEnterEncodeTatie = ref<InstanceType<typeof DisplaySettingSampleView> | null>(null)

// エンコードダイアログを閉じる
const closeEncodeDialog = (): void => {
  isEncodeOpen.value = false
  disableEnterEncode.value = false
  encodeAns.value = ''
}

// どちらのtatieOrderListを使用するか判断する変数
// true ならfileTatieOrderList、falesならプロファイルのtatieOrderListとなる
const isFileTatieOrderSetting = ref<boolean>(false)

// 使用するtatieOrderListを選択
const editTatieOrderList = ref<tatieOrderListType[]>(tatieOrderList.value)

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

// 既存のキャラ設定をコピー
const CopyKyaraSetting = (dataType: dataTextType, uuid: string): void => {
  try {
    // UUID で検索
    const copykyara = dateList.value.find((e) => e.uuid === uuid)

    if (copykyara !== undefined) {
      dateList.value.push(CreateCopyDateList(copykyara, dataType))

      // 追加した要素を選択状態にする
      selectKyara.value = dateList.value.length - 1
      console.log('現在編集中のキャラ設定: ' + dateList.value[selectKyara.value].name)
      if (props.settype !== dataType) {
        props.setTypeChange(dataType)
      }
    }
  } catch (e) {
    // something wrong
    console.log('キャラ設定エラー')
  }
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
  if (props.settype === 'kyara' || props.settype === 'kyast') {
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
}

// フォルダの選択画面の表示して、
// 指定されたフォルダの音声ファイルを表示する。
const loadVoiceDirList = (): void => {
  // 音声ファイルのリストとそれらがあるディレクトリのパスを取得
  const [ans, dir] = analysisFileName(['wav', 'WAV', 'ogg', 'flac', 'opus'], true, voiceLoadDirPath.value ?? undefined)

  //
  if (ans.length !== 0) {
    voiceLoadDirPath.value = dir
    const tempbuf = [...dateList.value]

    // dateList.value[selectKyara.value] をいったん0を指すようにする。
    selectKyara.value = 0

    // 別ディレクトリの音声ファイル情報がある場合はそれを排除します。
    dateList.value = tempbuf.filter((item) => item.dataType !== 'seid')

    // 音声ファイル名と同じ名前の字幕テキストファイルを読み込んで、字幕の内容をUUIDをキーにした連想配列に入れる。
    const itemList: { uuid: string; fileName: string }[] = ans.map((item) => {
      return { uuid: item.uuid, fileName: item.fileName }
    })
    subTextStringList.value = yomAPI.getSubTextStringList(voiceLoadDirPath.value, itemList)

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
      tatieOrderList.value,
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
  const ans = writeProfilleSettingData(inputProfileUUID.value, infoData.value, tatieOrderList.value, settingListDate)

  // 音声ファイルディレクトリを読み込んでいれば記録する
  let ans2 = true
  if (voiceLoadDirPath.value !== '' && voiceDirData.length !== 0) {
    ans2 = writeVoiceFileSettingData(voiceLoadDirPath.value, voiceDirData)
  }

  const ans3 = writeFileListKyaraData(fileListTatie.value)

  console.log('書き込み結果: ' + ans + ans2)

  // 保存が終わったのでフラグを修正する。
  props.setChangeDataSettingSta(false)
  yomAPI.saveStatus(true)
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
    index,
    infoData.value,
    'tatieUUID',
    dateList.value,
    'seid',
    tatieOrderList.value,
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
  tatieOrderList.value = profile.tatieOrderList
  inputProfileUUID.value = uuid

  // 起動時に開くプロファイルを変更する。
  writeGlobalSetting({ ...globalSetting, selectProfile: uuid })
}

// キャラ名とスタイル名で検索
const searchKyaraString = ref<string>(undefined)
const searchKyaraEvent = (text: string) => {
  searchKyaraString.value = text
  console.log('searchKyaraString: ' + searchKyaraString.value)
}

// seidキャラ設定のfileTatieOrderListを子コンポーネントに渡すか判断する
// true ならfileTatieOrderList、falesならプロファイルのtatieOrderListとなる
const selectFileTatieOrderSetting = (): void => {
  if (props.settype === 'seid' && dateList.value[selectKyara.value]?.fileTatieOrderList.active) {
    isFileTatieOrderSetting.value = true
    editTatieOrderList.value = dateList.value[selectKyara.value]?.fileTatieOrderList.val
  } else {
    isFileTatieOrderSetting.value = false
    editTatieOrderList.value = tatieOrderList.value
  }
}

// 立ち絵の表示順をマウスで入れ替えるため、
// 移動開始時の数値を保存する
const TatieOrderDragStart = (index: number) => {
  dragStartIndex.value = index
}

// 立ち絵の順番を入れ替える
const TatieOrderDragMove = (index: number) => {
  // もし、移動されていた場合は移動対象の配列要素を取り出して、
  // indexで指定された場所に差し込む形で追加する。
  // 処理が終わったら dragStartIndex.value と index の値を一致させて処理が無駄に実行されないようにする。
  if (index !== dragStartIndex.value) {
    const moveItem = editTatieOrderList.value.splice(dragStartIndex.value, 1)[0]
    editTatieOrderList.value.splice(index, 0, moveItem)
    dragStartIndex.value = index
    // 立ち絵の変換サンプルを更新
    refEnterEncodeTatie.value?.enterEncodeTatie()
  }
}

// 立ち絵順序の設定で、表示する立ち絵を追加する。
// まだ追加されておらず、立ち絵が設定されているキャラ設定を調べて、それを追加する。
// ない場合はデフォルトの項目を追加する。
const TatieOrderNew = () => {
  const ans = dateList.value.find((e) => {
    return (
      editTatieOrderList.value.findIndex(
        (f) => e.dataType + e.name + e.kyaraStyle === f.dataType + f.name + f.kyaraStyle,
      ) === -1 &&
      (e.tatie.waitTatieUUID.active || e.tatie.tatieUUID.active)
    )
  })

  if (ans !== undefined) {
    TatieOrderAdd([ans])

    // 立ち絵の変換サンプルを更新
    refEnterEncodeTatie.value?.enterEncodeTatie()
  } else {
    TatieOrderAdd([dateList.value[0]])
  }
}

// editTatieOrderListに表示する立ち絵を追加する。
// 配列で複数の立ち絵順序の設定をできる。
const TatieOrderAdd = (outSettingTtems: outSettingType[]) => {
  for (const item of outSettingTtems) {
    editTatieOrderList.value.push({
      uuid: yomAPI.getUUID(),
      dataType: item.dataType,
      name: item.name,
      kyaraStyle: item.dataType === 'kyast' ? item.kyaraStyle : undefined,
      tatieSituation: item.tatie.waitTatieUUID.active ? 'waitTatieUUID' : 'tatieUUID',
    })
  }
}

// editTatieOrderListに表示する立ち絵を、選択されたキャラに変更する。
const TatieOrderChange = (uuid: string, outSetting: outSettingType) => {
  const changeItemindex = tatieOrderList.value.findIndex((e) => e.uuid === uuid)

  // 値が見つかったら変更
  if (changeItemindex !== -1) {
    tatieOrderList.value[changeItemindex] = {
      uuid: uuid,
      dataType: outSetting.dataType,
      name: outSetting.name,
      kyaraStyle: outSetting.dataType === 'kyast' ? outSetting.kyaraStyle : undefined,
      tatieSituation: outSetting.tatie.waitTatieUUID.active ? 'waitTatieUUID' : 'tatieUUID',
    }
  }
  // 立ち絵の変換サンプルを更新
  refEnterEncodeTatie.value?.enterEncodeTatie()
}

// editTatieOrderListに表示する立ち絵を削除する。
const TatieOrderDel = (index: number) => {
  editTatieOrderList.value.splice(index, 1)
  // 立ち絵の変換サンプルを更新
  refEnterEncodeTatie.value?.enterEncodeTatie()
}

// editTatieOrderListのtatieSituation設定を変更する。
const TatieOrderChangeSituation = (index: number) => {
  if (editTatieOrderList.value[index].tatieSituation === 'tatieUUID') {
    editTatieOrderList.value[index].tatieSituation = 'waitTatieUUID'
  } else {
    editTatieOrderList.value[index].tatieSituation = 'tatieUUID'
  }
  // 立ち絵の変換サンプルを更新
  refEnterEncodeTatie.value?.enterEncodeTatie()
}

// キャラ名やスタイル名で検索したときに、
// 現在表示中のキャラ設定がリストに表示されなくなったか確認する。
// 表示されなくなったら、表示されている項目に切り替える。
// もし検索がヒットしない場合は、表示なしに切り替える
watch(
  () => searchKyaraString.value,
  () => {
    console.log('searchKyaraString.value: ' + searchKyaraString.value)
    if (searchKyaraString.value === '' || searchKyaraString.value === undefined) {
      // 検索文字列が空になった場合は、それ以外で検索して表示する。
      // 表示できるものがなければ何も表示しない。
      if (dateList.value[selectKyara.value]?.name === undefined) {
        const ans = dateList.value.findIndex((item) => item.dataType === props.settype)
        if (ans !== -1) {
          setDataTypeClick(ans, dateList.value[ans])
        } else {
          setDataTypeClick(-1, dateList.value[0])
        }
      }
    } else if (
      FindAllString(searchKyaraString.value, [
        dateList.value[selectKyara.value]?.name,
        props.settype === 'kyast' && dateList.value[selectKyara.value]?.kyaraStyle,
      ]) === false
    ) {
      // 検索文字列で検索して、部分一致があればそれを表示する。
      // 表示できるものがなければ何も表示しない。
      const ans = dateList.value.findIndex(
        (item) =>
          item.dataType === props.settype &&
          FindAllString(searchKyaraString.value, [item.name, props.settype === 'kyast' && item.kyaraStyle]) === true,
      )
      if (ans !== -1) {
        setDataTypeClick(ans, dateList.value[ans])
      } else {
        setDataTypeClick(-1, dateList.value[0])
      }
    }
  },
)

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

    // 立ち絵順序の設定のときは行わない
    if (props.settype !== 'tatieOrder') {
      //// 設定タイプを切り替えたときに、どのキャラ設定を選択するか決める。
      // 以前に開いた記録があるか確認し、あればそれに変更(立ち絵か字幕かの設定タイプ含めて)、なければ一番最初の要素を開く
      //
      // ただし、過去に開いていた項目が削除されている場合は、別のものを選択するか、未選択状態にする。
      const afterSelect = beforeKyaraSelect.value.find(
        (e) => dateList.value[e.selectedKyaraIndex]?.dataType === props.settype,
      )
      if (afterSelect === undefined) {
        // 何も選択されていなかった場合の処理
        // dateList.value[selectKyara.value] が、一瞬でも存在しない値を指すとエラーになるので、いったん別の変数に入れる
        // const newSelextKyaraIndex = dateList.value.findIndex((e) => e.dataType === props.settype)
        const ans = dateList.value.findIndex(
          (e) =>
            e.dataType === props.settype &&
            FindAllString(searchKyaraString.value, [e.name, props.settype === 'kyast' && e.kyaraStyle]) === true,
        )
        if (ans !== -1) {
          setDataTypeClick(ans, dateList.value[ans])
        } else {
          setDataTypeClick(-1, dateList.value[0])
        }
        editData.value = 'tatie'
      } else if (props.settype === 'defo') {
        // デフォルト画面の場合
        editData.value = afterSelect.selectedEditData
        setDataTypeClick(afterSelect.selectedKyaraIndex, dateList.value[afterSelect.selectedKyaraIndex])
      } else {
        // なにか選択されていた場合でも、検索の内容を確認して操作する。
        if (
          afterSelect.selectedKyaraIndex === -1 ||
          FindAllString(searchKyaraString.value, [
            dateList.value[afterSelect.selectedKyaraIndex]?.name,
            props.settype === 'kyast' && dateList.value[afterSelect.selectedKyaraIndex]?.kyaraStyle,
          ]) === false
        ) {
          // 以前に開いたキャラが検索に一致しない場合は、一致するキャラを表示する。
          // 検索して何もキャラが見つからない場合は、表示しない。
          const ans = dateList.value.findIndex(
            (item) =>
              item.dataType === props.settype &&
              FindAllString(searchKyaraString.value, [item.name, props.settype === 'kyast' && item.kyaraStyle]) ===
                true,
          )
          if (ans !== -1) {
            setDataTypeClick(ans, dateList.value[ans])
          } else {
            setDataTypeClick(-1, dateList.value[0])
          }
          editData.value = 'tatie'
        } else {
          // 検索に一致する場合それを表示する。
          editData.value = afterSelect.selectedEditData
          setDataTypeClick(afterSelect.selectedKyaraIndex, dateList.value[afterSelect.selectedKyaraIndex])
        }
      }
    }

    // プロファイル全体か個別かどちらのtatieOrderListを利用するか決める
    selectFileTatieOrderSetting()
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

// seidのfileTatieOrderList.activeが変更されたときに、どのtatieOrderListを利用するか決める
watch(
  () => dateList.value[selectKyara.value]?.fileTatieOrderList.active,
  () => {
    // プロファイル全体か個別かどちらのtatieOrderListを利用するか決める
    selectFileTatieOrderSetting()
  },
)

// 設定に編集があったときにはtrueを入れる
watch(
  () => [dateList.value, infoData.value, editTatieOrderList.value],
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
        :settype="settype"
        :higherUpList="higherUpList"
        :selectKyara="selectKyara"
        :infoData="infoData"
        :tatieOrderList="editTatieOrderList"
        :isFileTatieOrderSetting="isFileTatieOrderSetting"
        ref="refEnterEncodeTatie"
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
        :subTextStringList="subTextStringList"
        :useSubText="globalSetting.useSubText"
        :searchKyaraEvent="searchKyaraEvent"
        :CopyKyaraSetting="CopyKyaraSetting"
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
      <div class="flex h-9 justify-between" v-if="settype !== 'tatieOrder'">
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
          <button
            :class="actset('tatieOrder')"
            @click="setClick('tatieOrder')"
            v-if="settype === 'seid'"
            title="どの立ち絵を表示するかと、表示順を設定して前に表示したい立ち絵を決定します。"
          >
            順番
          </button>
          <button :class="actset('tatie')" @click="setClick('tatie')">立ち絵</button>
          <button :class="actset('subtitle')" @click="setClick('subtitle')">字幕</button>
        </div>
      </div>
      <div class="h-[610px] rounded-md border-2 bg-gray-200 p-2">
        <div class="flex items-center justify-between" v-if="settype === 'tatieOrder'">
          <div title="個別の設定がOFFの場合はこちらの設定が優先されます">このプロファイルの立ち絵表示順番</div>
        </div>
        <div
          class="flex items-center justify-between border-b border-gray-400"
          v-if="settype === 'seid' && editData === 'tatieOrder'"
        >
          <div title="個々の音声ファイルで個別の設定を行いたい場合はこちらをONにします">
            選択中の音声ファイルの立ち絵表示順番
          </div>
        </div>
        <div
          class="my-2 flex h-7 justify-between border-b-[1px] border-gray-400"
          v-if="editData !== 'tatieOrder' && settype !== 'tatieOrder'"
        >
          <div class="mr-3 flex w-[37rem] items-center overflow-hidden truncate border-r-[1px] border-gray-400 pr-1">
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
        <setTatieOrder
          :selectKyara="selectKyara"
          :dateList="dateList"
          :settype="settype"
          :higherUpList="higherUpList"
          :fileListTatie="fileListTatie"
          :inputProfileUUID="inputProfileUUID"
          :tatieOrderList="editTatieOrderList"
          :isFileTatieOrderSetting="isFileTatieOrderSetting"
          :TatieOrderDragStart="TatieOrderDragStart"
          :TatieOrderDragMove="TatieOrderDragMove"
          :TatieOrderNew="TatieOrderNew"
          :TatieOrderChange="TatieOrderChange"
          :TatieOrderDel="TatieOrderDel"
          :TatieOrderChangeSituation="TatieOrderChangeSituation"
          v-else-if="settype === 'tatieOrder' || (editData === 'tatieOrder' && dateList[selectKyara] !== undefined)"
        />
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
