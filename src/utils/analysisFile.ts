import {
  outSettingType,
  infoSettingType,
  profileKyaraExportType,
  fileListTatieExportType,
  fileListTatieType,
  encodeProfileSendReType,
} from '../type/data-type'
import { ref } from 'vue'
import { createNewDataID, createNewDateList } from './analysisData'
import { createDefoFileListTatie } from './analysisGeneral'
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
  const inputData = ref<{
    softVer: [number, number, number]
    exportStatus: number
    settingList: outSettingType[]
  }>(null)
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
        const kyaraName = nameData[1] !== undefined ? nameData[1].split('（')[0] : undefined

        // スタイル名を入れる。なければundefinedにする。
        const kyaraStyle = list.includes('（') || list.includes('(') ? nameData[1].split(/（|\(|）|\)/)[1] : undefined

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
  const outPrData = {
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
  encodeSetting: encodeProfileSendReType,
): Promise<string> => {
  // JSONファイルへの変換
  const outJsonData = JSON.stringify(encodeSetting, undefined, 2)

  // 変換の実施
  return yomAPI.enterEncodeVideoData(voiceFileDirPath, outJsonData)
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
