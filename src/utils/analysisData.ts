import {
  outSettingType,
  tatieSideType,
  subAlignmentSideType,
  dataTextType,
  tatieSettingType,
  subtitleSettingType,
  fileListTatieType,
  tatieSetting,
  subtitleSetting,
  globalSettingExportType,
  globalSettingType,
  inputProfileSendReType,
  kyaraProfileListExportType,
  kyaraProfileListType,
} from '../type/data-type'
import { NowTimeData } from './analysisGeneral'
import {
  DEFAULT_KYARA_PROFILE_NAME,
  DEFAULT_KYARA_TATIE_UUID,
  DEFAULT_FONT_WIN,
  DEFAULT_FONT_LINUX,
} from '../data/data'
import { ref } from 'vue'

const { yomAPI } = window

// outSettingType形式の変数を比較し同一かどうか判定する。
export const analysisDataComparisonOutSettingType = (element: outSettingType, target: outSettingType): boolean => {
  return (
    element.dataType === target.dataType && element.name === target.name && element.kyaraStyle === target.kyaraStyle
  )
}

// 与えられた文字列からハッシュを作成
// ID用に使う
export const createStringHash = (data: string): number => {
  return yomAPI.getHashData(data)
}

// dateListに新しいデータを入れる際に、他と衝突していないIDを作成する
export const createNewDataID = (dateList: outSettingType[], newName: string): number => {
  let newID = <number>0

  newID = createStringHash(newName) // 重ならないように現在時刻を追加

  // 同じIDが作られたら、現在時刻を加えて再作成、それでだめならエラー
  if (dateList.findIndex((e) => e.uuid === newID.toString()) !== -1) {
    newID = createStringHash(newName + new Date().getTime()) // 重ならないように現在時刻を追加

    if (dateList.findIndex((e) => e.uuid === newID.toString()) !== -1) {
      return -1
    }
  }

  return newID
}

// 動作環境がlinuxかWindowsか取得する
export const getPlatform = (): NodeJS.Platform => {
  return yomAPI.getPlatformData()
}

// dateListに追加や変更を行うときに、キャラ名とスタイル名が同じ要素が入らないように調べる。
// 同じ要素があればtrueを返す
export const checkSameValues = (dateList: outSettingType[], item: outSettingType, indexNum?: number): boolean => {
  const ans = dateList.findIndex(
    (e, index) =>
      index !== indexNum && e.dataType === item.dataType && e.name === item.name && e.kyaraStyle === item.kyaraStyle,
  )

  if (ans === -1) {
    return false
  } else {
    return true
  }
}

// editKyaraSelectの上位設定が存在するか確認するために、キャラ設定のタイプによって
// 同じ名前やスタイルの設定が上位dataTypeであるか、確認する。
export const ansFindIndex = (kyaraType: 'kyast' | 'kyara', dateList: outSettingType[], selectKyara: number): number => {
  const ansFindIndex = ref<number>(0)

  // kyastの照合を行う場合、スタイルだけでなくキャラ名も一致している必要がある
  if (kyaraType === 'kyast') {
    ansFindIndex.value = dateList.findIndex(
      (e) =>
        e.dataType === 'kyast' &&
        e.kyaraStyle === dateList[selectKyara]?.kyaraStyle &&
        e.name === dateList[selectKyara]?.name,
    )
  } else {
    ansFindIndex.value = dateList.findIndex((e) => e.dataType === 'kyara' && e.name === dateList[selectKyara]?.name)
  }

  if (ansFindIndex.value !== -1) {
    return ansFindIndex.value
  } else {
    return 0
  }
}

// 編集中のキャラ設定で、指定した項目が上位設定を使用する際に、どのキャラ設定を使用するか判定する。
// 使用するdateListのindex番号を出力する
// これをforで回せば上位設定があるかわかる。
// 0に当たった時点で上位設定が存在しない。
export const SelectHigherUpIndexList = (
  settype: dataTextType,
  dateList: outSettingType[],
  selectKyara: number,
): [number, number] => {
  // 選択中のキャラ設定のタイプによって動作を変える
  if (settype === 'seid') {
    return [ansFindIndex('kyast', dateList, selectKyara), ansFindIndex('kyara', dateList, selectKyara)]
  } else if (settype === 'kyast') {
    return [ansFindIndex('kyara', dateList, selectKyara), 0]
  } else {
    return [0, 0]
  }
}

// キャラ設定について、SelectHigherUpIndexの結果から個々の上位設定のactiveを調べて、
// どの上位設定を表示するか、dateListのindex番号を出力する。
// 立ち絵と字幕で処理が別れている
export const SelectTatieIndexHigherUpData = (
  indexList: [number, number],
  dateList: outSettingType[],
  settingType: tatieSettingType,
): number => {
  // indexListを順番に検索、indexListの値が0の場合（デフォルト設定）ではなく、activeの値がtrueなら、dateListのindex番号を返す。
  const ans = indexList.find((e) => e !== 0 && dateList[e].tatie[settingType].active === true)
  // console.log('配列: [' + indexList + '], 結果: ' + ans)
  // i見つからなかった場合は、0を返してデフォルト値を使用するようにする。
  return ans ?? 0
}

export const SelectSubtitleIndexHigherUpData = (
  indexList: [number, number],
  dateList: outSettingType[],
  settingType: subtitleSettingType,
): number => {
  // indexListを順番に検索、indexListの値が0の場合（デフォルト設定）ではなく、activeの値がtrueなら、dateListのindex番号を返す。
  const ans = indexList.find((e) => e !== 0 && dateList[e].subtitle[settingType].active === true)
  // console.log('配列: [' + indexList + '], 結果: ' + ans)
  // i見つからなかった場合は、0を返してデフォルト値を使用するようにする。
  return ans ?? 0
}

// dateListにpushする新しいデータを作成する
export const createNewDateList = (
  dataType: dataTextType,
  uuid: string,
  name: string,
  kyaraStyle: string,
  tatie?: {
    tatieUUID?: string
    waitTatieUUID?: string
    moviW?: number
    moviH?: number
    tatieConp?: boolean
    tatieSide?: tatieSideType
    tatieHpx?: number
    tatiePwPs?: number
    tatiePhPs?: number
    fps?: number
  },
  subtitle?: {
    subText?: boolean
    fontsPath?: string
    subAlignment?: subAlignmentSideType
    subAutoRt?: boolean
    subTextBord?: boolean
    subBG?: boolean
    subSize?: number
    subTextSpaceSize?: number
    subColor?: string
    subOrdercr?: string
    subBorderW?: number
    subBgcolor?: string
    subBgTr?: number
    subTextUseVoiceFileName?: boolean
    subChangeSta?: boolean
    subSideSpaceSize?: number
    nameTagStringDis?: boolean
    nameTagString?: string
    nameTagH?: number
    nameTagW?: number
  },
  fileName?: string,
  fileExtension?: string,
  voiceID?: string,
  platform?: NodeJS.Platform,
): outSettingType => {
  return {
    dataType: dataType,
    uuid: uuid,
    name: name,
    kyaraStyle: kyaraStyle,
    tatie: {
      tatieUUID: {
        val: tatie.tatieUUID ?? DEFAULT_KYARA_TATIE_UUID,
        active: tatie.tatieUUID !== undefined ? true : false,
      },
      waitTatieUUID: {
        val: tatie.waitTatieUUID ?? DEFAULT_KYARA_TATIE_UUID,
        active: tatie.waitTatieUUID !== undefined ? true : false,
      },
      moviW: { val: tatie.moviW ?? 1280, active: tatie.moviW !== undefined ? true : false },
      moviH: { val: tatie.moviH ?? 720, active: tatie.moviH !== undefined ? true : false },
      tatieConp: { val: tatie.tatieConp ?? true, active: tatie.tatieConp !== undefined ? true : false },
      tatieSide: { val: tatie.tatieSide ?? 'SouthEast', active: tatie.tatieSide !== undefined ? true : false },
      tatieHpx: { val: tatie.tatieHpx ?? 40, active: tatie.tatieHpx !== undefined ? true : false },
      tatiePwPs: { val: tatie.tatiePwPs ?? 0, active: tatie.tatiePwPs !== undefined ? true : false },
      tatiePhPs: { val: tatie.tatiePhPs ?? 0, active: tatie.tatiePhPs !== undefined ? true : false },
      fps: { val: tatie.fps ?? 2, active: tatie.fps !== undefined ? true : false },
    },
    subtitle: {
      subText: { val: subtitle.subText ?? true, active: subtitle.subText !== undefined ? true : false },
      fontsPath: {
        val: subtitle.fontsPath ?? (platform === 'win32' ? DEFAULT_FONT_WIN : DEFAULT_FONT_LINUX),
        active: subtitle.fontsPath !== undefined ? true : false,
      },
      subAlignment: {
        val: subtitle.subAlignment ?? 'Center',
        active: subtitle.subAlignment !== undefined ? true : false,
      },
      subAutoRt: { val: subtitle.subAutoRt ?? true, active: subtitle.subAutoRt !== undefined ? true : false },
      subTextBord: { val: subtitle.subTextBord ?? true, active: subtitle.subTextBord !== undefined ? true : false },
      subBG: { val: subtitle.subBG ?? false, active: subtitle.subBG !== undefined ? true : false },
      subSize: { val: subtitle.subSize ?? 38, active: subtitle.subSize !== undefined ? true : false },
      subTextSpaceSize: {
        val: subtitle.subTextSpaceSize ?? 10,
        active: subtitle.subTextSpaceSize !== undefined ? true : false,
      },
      subColor: { val: subtitle.subColor ?? '#ffffff', active: subtitle.subColor !== undefined ? true : false },
      subOrdercr: { val: subtitle.subOrdercr ?? '#000000', active: subtitle.subOrdercr !== undefined ? true : false },
      subBorderW: { val: subtitle.subBorderW ?? 2, active: subtitle.subBorderW !== undefined ? true : false },
      subBgcolor: { val: subtitle.subBgcolor ?? '#0000ff', active: subtitle.subBgcolor !== undefined ? true : false },
      subBgTr: { val: subtitle.subBgTr ?? 0.7, active: subtitle.subBgTr !== undefined ? true : false },
      subTextUseVoiceFileName: {
        val: subtitle.subTextUseVoiceFileName ?? false,
        active: subtitle.subTextUseVoiceFileName !== undefined ? true : false,
      },
      subChangeSta: { val: subtitle.subChangeSta ?? false, active: subtitle.subChangeSta !== undefined ? true : false },
      subSideSpaceSize: {
        val: subtitle.subSideSpaceSize ?? 5,
        active: subtitle.subSideSpaceSize !== undefined ? true : false,
      },
      nameTagStringDis: {
        val: subtitle.nameTagStringDis ?? false,
        active: subtitle.nameTagStringDis !== undefined ? true : false,
      },
      nameTagString: { val: subtitle.nameTagString ?? '', active: subtitle.nameTagString !== undefined ? true : false },
      nameTagH: { val: subtitle.nameTagH ?? 0, active: subtitle.nameTagH !== undefined ? true : false },
      nameTagW: { val: subtitle.nameTagW ?? 0, active: subtitle.nameTagW !== undefined ? true : false },
    },
    fileName: fileName !== undefined ? fileName : '',
    fileExtension: fileExtension !== undefined ? fileExtension : '',
    voiceID: voiceID !== undefined ? voiceID : '',
  }
}

// 指定された既存のキャラ設定をコピーしたものを出力します。
export const CreateCopyDateList = (kyraData: outSettingType, dataType: dataTextType): outSettingType => {
  return {
    dataType: dataType,
    uuid: yomAPI.getUUID(),
    name: kyraData.name + (dataType === 'kyara' ? 'コピー' + NowTimeData('todaybumber') : ''),
    kyaraStyle: dataType === 'kyast' ? 'コピー' + NowTimeData('todaybumber') : undefined,
    tatie: JSON.parse(JSON.stringify(kyraData.tatie)),
    subtitle: JSON.parse(JSON.stringify(kyraData.subtitle)),
    fileName: '',
    fileExtension: '',
    voiceID: '',
  }
}

// 立ち絵のUUIDリストにpushする新しいデータを作成する
export const createNewFileListTatie = (uuid: string, fileName?: string, kyaraName?: string): fileListTatieType => {
  return {
    uuid: uuid,
    fileName: fileName !== undefined ? fileName : '',
    kyaraName: kyaraName !== undefined ? kyaraName : '',
    commonsID: '',
    memo: '',
  }
}

// 指定された音声ファイルについて、優先設定を取得・整理して変換用コマンドに渡す情報を作成する。
export const createVoiceFileEncodeSetting = (index: number, dateList: outSettingType[]): outSettingType => {
  // 結果を格納する連想配列を作成
  const outDataTatie = ref<tatieSetting>({
    tatieUUID: { val: '', active: false },
    waitTatieUUID: { val: '', active: false },
    moviW: { val: 0, active: false },
    moviH: { val: 0, active: false },
    tatieConp: { val: false, active: false },
    tatieSide: { val: 'SouthEast', active: false },
    tatieHpx: { val: 0, active: false },
    tatiePwPs: { val: 0, active: false },
    tatiePhPs: { val: 0, active: false },
    fps: { val: 0, active: false },
  })
  const outDataSubtitle = ref<subtitleSetting>({
    subText: { val: false, active: false },
    fontsPath: { val: '', active: false },
    subAlignment: { val: 'Center', active: false },
    subAutoRt: { val: true, active: false },
    subTextBord: { val: true, active: false },
    subBG: { val: false, active: false },
    subSize: { val: 38, active: false },
    subTextSpaceSize: { val: 2, active: false },
    subColor: { val: '#000000', active: false },
    subOrdercr: { val: '#000000', active: false },
    subBorderW: { val: 2, active: false },
    subBgcolor: { val: '#000000', active: false },
    subBgTr: { val: 0, active: false },
    subTextUseVoiceFileName: { val: false, active: false },
    subChangeSta: { val: false, active: false },
    subSideSpaceSize: { val: 5, active: false },
    nameTagStringDis: { val: false, active: false },
    nameTagString: { val: '', active: false },
    nameTagH: { val: 0, active: false },
    nameTagW: { val: 0, active: false },
  })

  // どの値を使用するか調査を行う
  // 立ち絵と字幕それぞれ別で調査を行う
  // 優先設定を使用する場合は、どれを使用するか調査して記録する
  for (const [key, value] of Object.entries(dateList[index].tatie)) {
    if (value.active === true) {
      outDataTatie.value[key as tatieSettingType].val = value.val
      outDataTatie.value[key as tatieSettingType].active = true
    } else {
      const ans = SelectTatieIndexHigherUpData(
        SelectHigherUpIndexList('seid', dateList, index),
        dateList,
        key as tatieSettingType,
      )
      outDataTatie.value[key as tatieSettingType].val = dateList[ans].tatie[key as tatieSettingType].val
      outDataTatie.value[key as tatieSettingType].active = true
    }
  }
  for (const [key, value] of Object.entries(dateList[index].subtitle)) {
    if (value.active === true) {
      outDataSubtitle.value[key as subtitleSettingType].val = value.val
      outDataSubtitle.value[key as subtitleSettingType].active = true
    } else {
      const ans = SelectSubtitleIndexHigherUpData(
        SelectHigherUpIndexList('seid', dateList, index),
        dateList,
        key as subtitleSettingType,
      )
      outDataSubtitle.value[key as subtitleSettingType].val = dateList[ans].subtitle[key as subtitleSettingType].val
      outDataSubtitle.value[key as subtitleSettingType].active = true
    }
  }

  // 結果を出力する
  return createNewDateList(
    dateList[index].dataType,
    dateList[index].uuid,
    dateList[index].name,
    dateList[index].kyaraStyle,
    {
      tatieUUID: outDataTatie.value.tatieUUID.val,
      waitTatieUUID: outDataTatie.value.waitTatieUUID.val,
      moviW: outDataTatie.value.moviW.val,
      moviH: outDataTatie.value.moviH.val,
      tatieConp: outDataTatie.value.tatieConp.val,
      tatieSide: outDataTatie.value.tatieSide.val,
      tatieHpx: outDataTatie.value.tatieHpx.val,
      tatiePwPs: outDataTatie.value.tatiePwPs.val,
      tatiePhPs: outDataTatie.value.tatiePhPs.val,
      fps: outDataTatie.value.fps.val,
    },
    {
      subText: outDataSubtitle.value.subText.val,
      fontsPath: outDataSubtitle.value.fontsPath.val,
      subAlignment: outDataSubtitle.value.subAlignment.val,
      subAutoRt: outDataSubtitle.value.subAutoRt.val,
      subTextBord: outDataSubtitle.value.subTextBord.val,
      subBG: outDataSubtitle.value.subBG.val,
      subSize: outDataSubtitle.value.subSize.val,
      subTextSpaceSize: outDataSubtitle.value.subTextSpaceSize.val,
      subColor: outDataSubtitle.value.subColor.val,
      subOrdercr: outDataSubtitle.value.subOrdercr.val,
      subBorderW: outDataSubtitle.value.subBorderW.val,
      subBgcolor: outDataSubtitle.value.subBgcolor.val,
      subBgTr: outDataSubtitle.value.subBgTr.val,
      subTextUseVoiceFileName: outDataSubtitle.value.subTextUseVoiceFileName.val,
      subChangeSta: outDataSubtitle.value.subChangeSta.val,
      subSideSpaceSize: outDataSubtitle.value.subSideSpaceSize.val,
      nameTagStringDis: outDataSubtitle.value.nameTagStringDis.val,
      nameTagString: outDataSubtitle.value.nameTagString.val,
      nameTagH: outDataSubtitle.value.nameTagH.val,
      nameTagW: outDataSubtitle.value.nameTagW.val,
    },
    dateList[index].fileName,
    dateList[index].fileExtension,
    dateList[index].voiceID,
  )
}

// 全体設定を読み込み
export const getGlobalSetting = (): globalSettingType => {
  // JSONファイル読み込み
  const inputJsonData: globalSettingExportType = JSON.parse(yomAPI.getGlobalSettingData())

  return inputJsonData.globalSetting
}

// キャラ設定プロファイルのリストを読み込み
export const getKyaraProfileList = (): kyaraProfileListType[] => {
  // JSONファイル読み込み
  const inputJsonData: kyaraProfileListExportType = JSON.parse(yomAPI.getJsonFileData('kyaraProfileList'))

  return inputJsonData.kyaraProfileList
}

// キャラ設定プロファイルのリストを書き込み
export const writeKyaraProfileList = async (lists: kyaraProfileListType[]): Promise<boolean> => {
  // バージョン番号を取得
  const softVerData = yomAPI.getSoftVersionData()

  // 送付するデータを作成して、JSON形式に変換する
  const outPrData: kyaraProfileListExportType = {
    softVer: softVerData.softVer,
    exportStatus: softVerData.exportStatus,
    kyaraProfileList: lists,
  }
  const outJsonData = JSON.stringify(outPrData, undefined, 2)

  // ファイルへの書き込みを実行
  return yomAPI.writeJsonFileData('kyaraProfileList', outJsonData)
}

// 新しく作られたキャラ設定プロファイルをリストに追加する
export const AddListNewKyaraProfile = async (kyaraProfileList: kyaraProfileListType[], uuid: string): Promise<void> => {
  const newList = kyaraProfileList.concat({
    uuid: uuid,
    displayName: '新規' + NowTimeData('todaybumber'),
  })
  writeKyaraProfileList(newList)
}

// 指定されたUUIDのプロファイルをリストから削除する。
export const RemoveListKyaraProfile = async (kyaraProfileList: kyaraProfileListType[], uuid: string): Promise<void> => {
  // 指定されたUUID以外を抽出して書き込む
  const newList = kyaraProfileList.filter((e) => e.uuid !== uuid)
  writeKyaraProfileList(newList)
}

// 全体設定を書き込み
export const writeGlobalSetting = (globalSetting: globalSettingType): boolean => {
  // バージョン番号を取得
  const softVerData = yomAPI.getSoftVersionData()

  // 送付するデータを作成して、JSON形式に変換する
  const outPrData = {
    softVer: softVerData.softVer,
    exportStatus: softVerData.exportStatus,
    globalSetting: globalSetting,
  }
  const outJsonData = JSON.stringify(outPrData, undefined, 2)

  // ファイルへの書き込みを実行
  const ans = yomAPI.writeGlobalSettingData(outJsonData)

  return ans
}

// キャラ設定プロファイルを読み込む
// 引数で指定されていない場合は全体設定で指定されているファイルから読み込む
export const loadProfile = (profileName?: string): inputProfileSendReType => {
  // 読み込む設定プロファイル番号を指定する。（拡張子「.json」は含めいないこと）
  const inputProfileName = profileName ?? getGlobalSetting().selectProfile ?? DEFAULT_KYARA_PROFILE_NAME

  // JSONファイル読み込み
  return yomAPI.getKyaraProfileData(inputProfileName)
}

// 第１引数で指定された文字列で、第２引数で指定された文字列を検索する。
// 第１引数の文字列は半角・全角スペースで分割しAND検索を行う。
export const FindAllString = (searchString: string | undefined, findList: string[]): boolean => {
  // 検索文字列がない場合はtrueを返す
  if (searchString === undefined || searchString === '') {
    return true
  }

  const splitSearchString = searchString.replaceAll('　', ' ').split(' ')

  // 検索対象文字列を半角スペースで区切って一つの文字列にする
  const findString = findList.join(' ')

  // 検索対象文字列を検索して、ひとつでも検索文字列が見つからなければfalseを返す。
  // and検索のため
  for (const val of splitSearchString) {
    if (findString.indexOf(val) === -1) {
      return false
    }
  }

  // 検索文字列がすべてあればtrueを返す。
  return true
}
