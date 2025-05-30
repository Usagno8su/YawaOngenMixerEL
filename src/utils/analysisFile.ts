import {
  outSettingType,
  infoSettingType,
  profileKyaraExportType,
  fileListTatieExportType,
  fileListTatieType,
  profileVoiceFileExportType,
  tatieOrderListType,
  dataTextType,
  tatieSituationType,
} from '../type/data-type'
import { ref } from 'vue'
import { createVoiceFileEncodeSetting, getPlatform } from './analysisData'
import { createDefoFileListTatie, NowTimeData, resizeKyaraDateDisplay, createNewDateList } from './analysisGeneral'
import { DEFAULT_KYARA_TATIE_UUID } from '../data/data'
const { yomAPI } = window

// ユーザーにディレクトリを選択させ、その中の音声ファイルを探してファイルのリストに入れる
// 音声ファイルの拡張子は配列で指定する。
// また、取得したディレクトリも返す
// fileSectionSplitHyphen: ハイフン「-」でもIDやキャラ名等のセクションを分割するかどうか
export const analysisFileName = (
  fileExtensionList: string[],
  fileSectionSplitHyphen: boolean,
  defoSelectDir?: string,
): [outSettingType[], string] => {
  const ansList = ref<outSettingType[]>([])

  // ファイルのリストと、それらがあるディレクトリのパスを取得
  const [lists, dir] = yomAPI.opneVoiceFileDir(defoSelectDir)

  // ディレクトリに個別設定データの設定ファイルがある場合は取得する
  const inputData = ref<profileVoiceFileExportType>(null)
  if (dir !== null) {
    try {
      inputData.value = JSON.parse(yomAPI.getVoiceFileDirData(dir))
    } catch (e) {
      inputData.value = null
    }
  }

  //// 個別設定リストの順番に、音声ファイルが存在するか確認する。
  //// 存在する場合はfileActiveをtrueにし、ない場合はfalesにする。

  // 取得結果が空でなければ実行
  if (inputData.value?.settingList !== undefined && inputData.value?.settingList?.length !== 0) {
    ansList.value = inputData.value.settingList.map((e) => {
      // リストのファイルが存在するか確認し、
      // 存在する場合はそのfileActiveをtrueにする。
      const fileAns = lists.findIndex((f) => f === e.fileName + '.' + e.fileExtension)
      if (fileAns !== -1) {
        e.fileActive = true
        // 存在したファイルはリストから消す
        lists.splice(fileAns, 1)
        return e
      } else {
        // ファイルが存在しないものをfalesにする
        e.fileActive = false
        return e
      }
    })
  }

  //// 個別設定リストにない音声ファイルを読み込んでリストに加える。

  // 取得結果が空でなければ実行
  if (lists.length !== 0) {
    // ファイルリストを調査し、必要な情報を入力する。
    for (const list of lists) {
      // 拡張子を取り出す
      const fileExtension = list.split('.').at(-1)

      // ファイル名（拡張子なし）を取り出す
      const fileName = list.split('.' + fileExtension)[0]

      // 音声ファイルならデータを配列に入力
      if (fileExtensionList.includes(fileExtension)) {
        // 指定されれば「-」でも分割する
        const nameData = list.split(fileSectionSplitHyphen ? /_|-/ : '_')

        // nameDataが分割できずに要素が一つしかない場合はファイル名をそのまま入れる
        const voiceID = nameData[1] !== undefined ? nameData[0] : fileName

        // nameDataが分割できずに要素が一つしかない場合はundefinedを入れる
        const kyaraName = nameData[1] !== undefined ? nameData[1].split(/（|\(/)[0] : undefined

        // スタイル名を入れる。なければundefinedにする。
        // スタイル名はカッコで囲われているので、それを削除する。
        const tempStyle = nameData[1].slice(kyaraName.length)
        const kyaraStyle = tempStyle !== undefined ? tempStyle.slice(1, -1) : undefined

        // 新規に出力する。
        ansList.value.push(
          createNewDateList(
            getPlatform(),
            'seid',
            yomAPI.getUUID(),
            kyaraName,
            kyaraStyle,
            {},
            {},
            fileName,
            fileExtension,
            voiceID,
            undefined,
            true,
          ),
        )
      }
    }
  }

  // ファイルのリストとディレクトリのパスを返す
  return [ansList.value, dir]
}

// メインプロセスに対して保存するプロファイルデータとプロファイル名を送り、設定を保存させる。
export const writeProfilleSettingData = (
  profilleName: string,
  infoSetting: infoSettingType,
  tatieOrderList: tatieOrderListType[],
  settingList: outSettingType[],
): boolean => {
  console.log(profilleName)

  // バージョン番号を取得
  const softVerData = yomAPI.getSoftVersionData()

  // 送付するデータを作成して、JSON形式に変換する
  const outPrData: profileKyaraExportType = {
    softVer: softVerData.softVer,
    exportStatus: softVerData.exportStatus,
    infoSetting: infoSetting,
    tatieOrderList: tatieOrderList,
    settingList: settingList,
  }
  const outJsonData = JSON.stringify(outPrData, undefined, 2)

  // ファイルへの書き込みを実行
  const ans = yomAPI.writeKyaraProfileData(profilleName, outJsonData)
  return ans
}

// メインプロセスに対して保存する音声ファイルの個別設定データと対象のディレクトリを送り、設定を保存させる。
export const writeVoiceFileSettingData = (voiceFileDirPath: string, settingList: outSettingType[]): boolean => {
  // バージョン番号を取得
  const softVerData = yomAPI.getSoftVersionData()

  // 送付するデータを作成して、JSON形式に変換する
  const outPrData: profileVoiceFileExportType = {
    softVer: softVerData.softVer,
    exportStatus: softVerData.exportStatus,
    settingList: settingList,
  }

  const outJsonData = JSON.stringify(outPrData, undefined, 2)

  // ファイルへの書き込みを実行
  const ans = yomAPI.writeVoiceFileData(voiceFileDirPath, outJsonData)

  return ans
}

// キャラUUIDリストのファイルを読み込んでリスト情報を返す
export const readFileListTatieData = (): fileListTatieType[] => {
  const inputData = ref<fileListTatieExportType>(null)

  try {
    inputData.value = JSON.parse(yomAPI.getFileListKyaraData())
  } catch (e) {
    inputData.value = null
  }

  // データがちゃんと取得できていたらそれを返す。(画像なしのUUIDをがe取得できている)
  // 破損しているときにはデフォルトのデータを返す。
  if (inputData.value.fileListTatie[0].uuid === DEFAULT_KYARA_TATIE_UUID) {
    return inputData.value.fileListTatie
  } else {
    return [createDefoFileListTatie()]
  }
}

// メインプロセスに対して保存するキャラUUIDリストを送り、設定を保存させる。
export const writeFileListKyaraData = (settingList: fileListTatieType[]): boolean => {
  // バージョン番号を取得
  const softVerData = yomAPI.getSoftVersionData()

  // 送付するデータを作成して、JSON形式に変換する
  const outPrData = {
    softVer: softVerData.softVer,
    exportStatus: softVerData.exportStatus,
    fileListTatie: settingList,
  }

  const outJsonData = JSON.stringify(outPrData, undefined, 2)

  // ファイルへの書き込みを実行
  const ans = yomAPI.writeFileListKyaraData(outJsonData)

  return ans
}

// 指定された音声ファイルの変換を行う。
export const enterEncodeVideoFile = async (
  voiceFileDirPath: string,
  selectKyara: number,
  infoSetting: infoSettingType,
  tatieSituation: tatieSituationType,
  dateList: outSettingType[],
  settype: dataTextType,
  tatieOrderList: tatieOrderListType[],
): Promise<string> => {
  // 変換の実施
  return yomAPI.enterEncodeVideoData(
    voiceFileDirPath,
    JSON.stringify(createVoiceFileEncodeSetting(selectKyara, dateList), undefined, 2),
    makeTatiePicEncodeList(tatieSituation, dateList, settype, tatieOrderList, selectKyara),
    JSON.stringify(infoSetting, undefined, 2),
  )
}

// 指定された立ち絵ファイルの変換を行う。
// 画面サイズが指定されている場合は、その情報も送付する。
export const enterEncodeTatiePicFile = async (
  tatieSituation: tatieSituationType,
  dateList: outSettingType[],
  settype: dataTextType,
  tatieOrderList: tatieOrderListType[],
  selectKyara?: number,
  size?: { w: number; h: number },
): Promise<{ buffer: Uint8Array; path: string }> => {
  return yomAPI.getEncodePicFileData(
    makeTatiePicEncodeList(tatieSituation, dateList, settype, tatieOrderList, selectKyara, size),
  )
}

// 立ち絵の表示順リスト（TatieOrderList）へ、outSettingTtemの内容を入れる。
// 既存のリストの内容を変更する際には、TatieOrderListのuuidを引数で指定して、同じUUIDが入るようにする。
// tatieSituation で会話中か待機中どちらの立ち絵を表示するか指定されているときはそれを指定、
// 　ないときはwaitTatieUUIDが設定されていればそちらを優先する。
export const TatieOrderListAddValue = (
  outSettingTtem: outSettingType,
  uuid?: string,
  tatieSituation?: tatieSituationType,
): tatieOrderListType => {
  return {
    uuid: uuid === undefined ? yomAPI.getUUID() : uuid,
    dataType: outSettingTtem.dataType,
    settingUUID: outSettingTtem.uuid,
    name: outSettingTtem.name,
    kyaraStyle: outSettingTtem.dataType === 'kyast' ? outSettingTtem.kyaraStyle : undefined,
    tatieSituation:
      tatieSituation !== undefined
        ? tatieSituation
        : outSettingTtem.tatie.waitTatieUUID.active
          ? 'waitTatieUUID'
          : 'tatieUUID',
  }
}

// 渡されたtatieOrderListを解析し、selectKyaraがある場合はその個別ファイル設定と重複するキャラ項目の場合は、そちらを優先するように書き換えて返す。
// 選択中の個別ファイル設定と一致するキャラがtatieOrderListにない場合は一番前に表示するように追加する。
export const MakeEncodeTatieOrderList = (
  tatieSituation: tatieSituationType,
  dateList: outSettingType[],
  tatieOrderList: tatieOrderListType[],
  selectKyara?: number,
): tatieOrderListType[] => {
  const selectSetting = selectKyara !== undefined ? createVoiceFileEncodeSetting(selectKyara, dateList) : undefined

  // seid のときに、selectKyaraのキャラがencodeListに入っているか確認する数値
  let chkSelectKyara = -1

  const outList = tatieOrderList.map((e) => {
    // ただ、会話中のキャラ(selectSetting)含まれている場合は、tatieSituationで指定されている状態の画像を選択させる。
    // そうではない場合は、そのまま出力する。
    if (
      e.name + (e.dataType === 'kyast' ? e.kyaraStyle : '') ===
      selectSetting?.name + (e.dataType === 'kyast' ? selectSetting?.kyaraStyle : '')
    ) {
      chkSelectKyara = 1
      return TatieOrderListAddValue(selectSetting, e.uuid, tatieSituation)
    } else {
      return e
    }
  })

  // selectKyaraでキャラが指定されているときに、outListにselectSettingのキャラがない場合は追加する
  if (selectKyara !== undefined && chkSelectKyara !== 1) {
    outList.unshift(TatieOrderListAddValue(selectSetting, undefined, tatieSituation))
  }

  return outList
}

// 立ち絵の変換を行う際に、mainに送付するデータを作成する。
// 複数の立ち絵を表示させる場合にはその内容をまとめて出力する。
// 画面サイズが指定されている場合は、その情報も送付する。
export const makeTatiePicEncodeList = (
  tatieSituation: tatieSituationType,
  dateList: outSettingType[],
  settype: dataTextType,
  tatieOrderList: tatieOrderListType[],
  selectKyara?: number,
  size?: { w: number; h: number },
): {
  outJsonData: string
  tatieSituation: string
}[] => {
  const selectSetting =
    selectKyara !== undefined
      ? resizeKyaraDateDisplay(createVoiceFileEncodeSetting(selectKyara, dateList), size)
      : undefined

  // seidキャラ設定のfileTatieOrderListを使用するか判断する
  // true ならfileTatieOrderList、falesならプロファイルのtatieOrderListとなる
  const useTatieOrderList: tatieOrderListType[] =
    dateList[selectKyara]?.fileTatieOrderList.active === true
      ? dateList[selectKyara].fileTatieOrderList.val
      : tatieOrderList

  // データ作成の実施
  if (settype === 'tatieOrder' || settype === 'seid') {
    const encodeList: {
      outJsonData: string
      tatieSituation: string
    }[] = MakeEncodeTatieOrderList(tatieSituation, dateList, useTatieOrderList, selectKyara)
      .map((e) => {
        // dateListに一致するものを探し、立ち絵の設定をencodeListに入れる。
        const ans = dateList.findIndex((f) => e.dataType + e.settingUUID === f.dataType + f.uuid)
        if (ans !== -1) {
          return {
            outJsonData: JSON.stringify(
              resizeKyaraDateDisplay(createVoiceFileEncodeSetting(ans, dateList), size),
              undefined,
              2,
            ),
            tatieSituation: e.tatieSituation,
          }
        }
      })
      .flatMap(
        (
          e,
        ):
          | {
              outJsonData: string
              tatieSituation: string
            }
          | undefined[] => {
          // mapで出るundefinedを消す
          return e ?? []
        },
      )

    console.log('encodeList: ' + encodeList.length)

    return encodeList
  } else {
    console.log('encodeList ではない: selectSetting: ' + selectSetting.name)
    return [{ outJsonData: JSON.stringify(selectSetting, undefined, 2), tatieSituation: tatieSituation }]
  }
}

// 変換された立ち絵ファイルを保存する。
// 保存ダイアログ表示時に特定のディレクトリを表示したい場合は defoDir を指定する。
export const enterSaveUint8ArrayFileData = async (buffer: Uint8Array, defoDir?: string): Promise<string> => {
  // デフォルトのファイル名を決める
  const fileName = 'tatie-img-' + NowTimeData('todaybumber') + '.png'

  // 保存ファイルの種類名
  const fileFiltersName = 'Image'

  // 保存する拡張子
  const fileFiltersExtensions = ['png']

  // 保存の実施
  return yomAPI.writeUint8ArrayFileData(buffer, fileName, fileFiltersName, fileFiltersExtensions, defoDir)
}

export const changeDirPath = async (path?: string, title?: string): Promise<string> => {
  return yomAPI.opneDir(path, title)
}

// 指定された拡張子のファイルをダイアログで取得する。
export const changeFilePath = async (
  path?: string,
  title?: string,
  filtersName?: string,
  filtersExtensions?: string[],
): Promise<string> => {
  return yomAPI.opneFile(path, title, filtersName, filtersExtensions)
}
