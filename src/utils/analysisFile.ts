import {
  outSettingType,
  infoSettingType,
  profileKyaraExportType,
  fileListTatieExportType,
  fileListTatieType,
  profileVoiceFileExportType,
  tatieOrderListType,
  dataTextType,
} from '../type/data-type'
import { ref } from 'vue'
import { createNewDataID, createNewDateList, createVoiceFileEncodeSetting } from './analysisData'
import { createDefoFileListTatie, NowTimeData } from './analysisGeneral'
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

        // ファイル名等が同じ個別設定データがある場合はそれを取り出す
        const fileSetting = inputData.value?.settingList.find(
          (e) =>
            e.fileName === fileName &&
            e.fileExtension === fileExtension &&
            e.name === kyaraName &&
            e.kyaraStyle === kyaraStyle,
        )

        // 同じ設定があるのであれば、それを出力する。
        // なければ新規に出力する。
        if (fileSetting !== undefined) {
          ansList.value.push(fileSetting)
        } else {
          ansList.value.push(
            createNewDateList(
              'seid',
              yomAPI.getUUID(),
              kyaraName,
              kyaraStyle,
              {},
              {},
              fileName,
              fileExtension,
              voiceID,
              yomAPI.getPlatformData(),
            ),
          )
        }
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
  encodeSetting: outSettingType,
  infoSetting: infoSettingType,
): Promise<string> => {
  // JSONファイルへの変換
  const outJsonData = JSON.stringify(encodeSetting, undefined, 2)

  // 変換の実施
  return yomAPI.enterEncodeVideoData(
    voiceFileDirPath,
    JSON.stringify(encodeSetting, undefined, 2),
    JSON.stringify(infoSetting, undefined, 2),
  )
}

// 指定された立ち絵ファイルの変換を行う。
export const enterEncodeTatiePicFile = async (
  tatieSituation: string,
  dateList: outSettingType[],
  settype: dataTextType,
  tatieOrderList: tatieOrderListType[],
  selectKyara?: number,
): Promise<{ buffer: Uint8Array; path: string }> => {
  const selectSetting = selectKyara !== undefined ? createVoiceFileEncodeSetting(selectKyara, dateList) : undefined

  // 変換の実施
  if (settype === 'tatieOrder' || settype === 'seid') {
    const encodeList = tatieOrderList.map((e) => {
      // dateListに一致するものを探す。

      const ans = dateList.findIndex((f) => e.dataType + e.name + e.kyaraStyle === f.dataType + f.name + f.kyaraStyle)
      // ただ、会話中のキャラ(selectSetting)含まれている場合は、tatieSituationで指定されている状態の画像を選択させる。
      if (ans !== -1) {
        return {
          outJsonData: JSON.stringify(createVoiceFileEncodeSetting(ans, dateList), undefined, 2),
          tatieSituation:
            e.dataType + e.name + e.kyaraStyle ===
            selectSetting?.dataType + selectSetting?.name + selectSetting?.kyaraStyle
              ? tatieSituation
              : e.tatieSituation,
        }
      }
    })

    console.log('encodeList: ' + encodeList.length)

    return yomAPI.getEncodePicFileData(encodeList)
  } else {
    console.log('encodeList ではない: selectSetting: ' + selectSetting.name)
    return yomAPI.getEncodePicFileData([
      { outJsonData: JSON.stringify(selectSetting, undefined, 2), tatieSituation: tatieSituation },
    ])
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
