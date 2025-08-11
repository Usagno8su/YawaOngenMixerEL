// メインプロセス・レンダラー側双方で使用するライブラリ。

import { createNewFileListTatie } from './analysisData'
import {
  outSettingType,
  infoSettingType,
  fileListTatieType,
  kyaraProfileListType,
  dataTextType,
  tatieSideType,
  subAlignmentSideType,
  tatieOrderListType,
  tatieColorOption,
} from '../type/data-type'
import {
  DEFAULT_KYARA_TATIE_UUID,
  DEFAULT_KYARA_PROFILE_NAME,
  DEFAULT_KYARA_PROFILE_DISPLAY_NAME,
  DEFAULT_KYARA_SETTING_UUID,
  DEFAULT_KYARA_SETTING_DISPLAY_NAME,
  DEFAULT_FONT_WIN,
  DEFAULT_FONT_LINUX,
} from '../data/data'

// デフォルトの基本設定データを作成して返す
export const createDefoInfoDateList = (): infoSettingType => {
  return {
    outDir: '',
    outPicDir: '',
    cutHR: true,
  }
}

// デフォルトのキャラ設定プロファイルリストを作成して返す。
export const createDefoKyaraProfileList = (): kyaraProfileListType => {
  return {
    uuid: DEFAULT_KYARA_PROFILE_NAME,
    displayName: DEFAULT_KYARA_PROFILE_DISPLAY_NAME,
  }
}

// dateListにpushする新しいデータを作成する
// dataType が 'defo' の場合は tatie と subtitle の active を true にする。
export const createNewDateList = (
  platform: NodeJS.Platform,
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
    rotate?: number
    tatieFlip?: boolean
    tatieFlop?: boolean
    ModulateBright?: number
    ModulateChroma?: number
    ModulateHue?: number
    tatieBlur?: [number, number]
    tatieMedian?: number
    tatieEdge?: number
    colorEdit?: tatieColorOption
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
  fileTatieOrderList?: tatieOrderListType[],
  fileActive?: boolean,
): outSettingType => {
  return {
    dataType: dataType,
    uuid: uuid,
    name: name,
    kyaraStyle: kyaraStyle,
    tatie: {
      tatieUUID: {
        val: tatie.tatieUUID ?? DEFAULT_KYARA_TATIE_UUID,
        active: tatie.tatieUUID !== undefined ? true : dataType === 'defo',
      },
      waitTatieUUID: {
        val: tatie.waitTatieUUID ?? DEFAULT_KYARA_TATIE_UUID,
        active: tatie.waitTatieUUID !== undefined ? true : dataType === 'defo',
      },
      moviW: { val: tatie.moviW ?? 1920, active: tatie.moviW !== undefined ? true : dataType === 'defo' },
      moviH: { val: tatie.moviH ?? 1080, active: tatie.moviH !== undefined ? true : dataType === 'defo' },
      tatieConp: { val: tatie.tatieConp ?? true, active: tatie.tatieConp !== undefined ? true : dataType === 'defo' },
      tatieSide: {
        val: tatie.tatieSide ?? 'SouthEast',
        active: tatie.tatieSide !== undefined ? true : dataType === 'defo',
      },
      tatieHpx: { val: tatie.tatieHpx ?? 65, active: tatie.tatieHpx !== undefined ? true : dataType === 'defo' },
      tatiePwPs: { val: tatie.tatiePwPs ?? 0, active: tatie.tatiePwPs !== undefined ? true : dataType === 'defo' },
      tatiePhPs: { val: tatie.tatiePhPs ?? 0, active: tatie.tatiePhPs !== undefined ? true : dataType === 'defo' },
      rotate: { val: tatie.rotate ?? 0, active: tatie.rotate !== undefined ? true : dataType === 'defo' },
      tatieFlip: { val: tatie.tatieFlip ?? false, active: tatie.tatieFlip !== undefined ? true : dataType === 'defo' },
      tatieFlop: { val: tatie.tatieFlop ?? false, active: tatie.tatieFlop !== undefined ? true : dataType === 'defo' },
      ModulateBright: {
        val: tatie.ModulateBright ?? 100,
        active: tatie.ModulateBright !== undefined ? true : dataType === 'defo',
      },
      ModulateChroma: {
        val: tatie.ModulateChroma ?? 100,
        active: tatie.ModulateChroma !== undefined ? true : dataType === 'defo',
      },
      ModulateHue: {
        val: tatie.ModulateHue ?? 100,
        active: tatie.ModulateHue !== undefined ? true : dataType === 'defo',
      },
      tatieMedian: {
        val: tatie.tatieMedian ?? 0,
        active: tatie.tatieMedian !== undefined ? true : dataType === 'defo',
      },
      tatieEdge: { val: tatie.tatieEdge ?? 0, active: tatie.tatieEdge !== undefined ? true : dataType === 'defo' },
      colorEdit: {
        val: tatie.colorEdit ?? {
          selectStyle: 'default',
          colorspaceOption: 'gray',
          negateOption: '',
          monochromeOption: '',
          sepiaToneOption: 80,
        },
        active: tatie.colorEdit !== undefined ? true : dataType === 'defo',
      },
      fps: { val: tatie.fps ?? 6, active: tatie.fps !== undefined ? true : dataType === 'defo' },
    },
    subtitle: {
      subText: { val: subtitle.subText ?? true, active: subtitle.subText !== undefined ? true : dataType === 'defo' },
      fontsPath: {
        val: subtitle.fontsPath ?? (platform === 'win32' ? DEFAULT_FONT_WIN : DEFAULT_FONT_LINUX),
        active: subtitle.fontsPath !== undefined ? true : dataType === 'defo',
      },
      subAlignment: {
        val: subtitle.subAlignment ?? 'Center',
        active: subtitle.subAlignment !== undefined ? true : dataType === 'defo',
      },
      subAutoRt: {
        val: subtitle.subAutoRt ?? true,
        active: subtitle.subAutoRt !== undefined ? true : dataType === 'defo',
      },
      subTextBord: {
        val: subtitle.subTextBord ?? true,
        active: subtitle.subTextBord !== undefined ? true : dataType === 'defo',
      },
      subBG: { val: subtitle.subBG ?? false, active: subtitle.subBG !== undefined ? true : dataType === 'defo' },
      subSize: { val: subtitle.subSize ?? 64, active: subtitle.subSize !== undefined ? true : dataType === 'defo' },
      subTextSpaceSize: {
        val: subtitle.subTextSpaceSize ?? 10,
        active: subtitle.subTextSpaceSize !== undefined ? true : dataType === 'defo',
      },
      subColor: {
        val: subtitle.subColor ?? '#ffffff',
        active: subtitle.subColor !== undefined ? true : dataType === 'defo',
      },
      subOrdercr: {
        val: subtitle.subOrdercr ?? '#000000',
        active: subtitle.subOrdercr !== undefined ? true : dataType === 'defo',
      },
      subBorderW: {
        val: subtitle.subBorderW ?? 2,
        active: subtitle.subBorderW !== undefined ? true : dataType === 'defo',
      },
      subBgcolor: {
        val: subtitle.subBgcolor ?? '#0000ff',
        active: subtitle.subBgcolor !== undefined ? true : dataType === 'defo',
      },
      subBgTr: { val: subtitle.subBgTr ?? 0.7, active: subtitle.subBgTr !== undefined ? true : dataType === 'defo' },
      subTextUseVoiceFileName: {
        val: subtitle.subTextUseVoiceFileName ?? false,
        active: subtitle.subTextUseVoiceFileName !== undefined ? true : dataType === 'defo',
      },
      subChangeSta: {
        val: subtitle.subChangeSta ?? false,
        active: subtitle.subChangeSta !== undefined ? true : dataType === 'defo',
      },
      subSideSpaceSize: {
        val: subtitle.subSideSpaceSize ?? 5,
        active: subtitle.subSideSpaceSize !== undefined ? true : dataType === 'defo',
      },
      nameTagStringDis: {
        val: subtitle.nameTagStringDis ?? false,
        active: subtitle.nameTagStringDis !== undefined ? true : dataType === 'defo',
      },
      nameTagString: {
        val: subtitle.nameTagString ?? '',
        active: subtitle.nameTagString !== undefined ? true : dataType === 'defo',
      },
      nameTagH: { val: subtitle.nameTagH ?? 0, active: subtitle.nameTagH !== undefined ? true : dataType === 'defo' },
      nameTagW: { val: subtitle.nameTagW ?? 0, active: subtitle.nameTagW !== undefined ? true : dataType === 'defo' },
    },
    fileName: fileName !== undefined ? fileName : '',
    fileExtension: fileExtension !== undefined ? fileExtension : '',
    voiceID: voiceID !== undefined ? voiceID : '',
    fileTatieOrderList: { val: fileTatieOrderList ?? [], active: fileTatieOrderList !== undefined ? true : false },
    fileActive: fileActive !== undefined ? fileActive : false,
  }
}

// デフォルトのキャラ設定データを作成して返す
export const createDefoKyaraDateList = (platform: NodeJS.Platform): outSettingType => {
  return createNewDateList(
    platform,
    'defo',
    DEFAULT_KYARA_SETTING_UUID,
    DEFAULT_KYARA_SETTING_DISPLAY_NAME,
    undefined,
    {},
    {},
  )
}

// デフォルトのキャラUUIDリストデータを作成して返す
export const createDefoFileListTatie = (): fileListTatieType => {
  return createNewFileListTatie(DEFAULT_KYARA_TATIE_UUID, '画像なし', 'なし')
}

// 配列の各数値を比較して中央に近い値を返す
// 配列が空だった場合は -1 を返す
export const arrayHalfValue = (list: number[]): number => {
  const sortList = list.sort()

  console.log('sortList' + sortList)

  if (sortList.length !== 0) {
    // 中央の値を返す
    // 配列の個数を２で割る
    // 小数点以下は切り捨てる。
    return sortList[Math.floor(list.length / 2)] ?? -1
  } else {
    return -1 // 空なら -1 を返す
  }
}

// 数値を指定された桁数の文字列にする。
export const padZeroString = (num: number, length: number): string => {
  return num.toString().padStart(length, '0')
}

// 現在時刻を出力する（文字列）
export const NowTimeData = (type?: string): string => {
  // 現在の日付を取得
  const nowTime = new Date()

  // 16進数UNIXタイムスタンプで出力する
  if (type === 'UNIX16') {
    return Math.floor(nowTime.getTime()).toString(16)

    // 日付を数値のみで出力する
  } else if (type === 'todaybumber') {
    return (
      `${nowTime.getFullYear()}${padZeroString(nowTime.getMonth() + 1, 2)}${padZeroString(nowTime.getDate(), 2)}` +
      `${padZeroString(nowTime.getHours(), 2)}${padZeroString(nowTime.getMinutes(), 2)}${padZeroString(nowTime.getSeconds(), 2)}`
    )
  } else {
    // 設定がなければUNIXタイムスタンプを秒単位に変換して出力する
    return Math.floor(nowTime.getTime() / 1000).toString()
  }
}

// 引数で渡された複数のTailwindのタグを結合して返す
// 引数の数は可変
export const MakeClassString = (...classString: string[]): string => {
  return classString.join(' ')
}

// 画面サイズの設定を、指定された縦横の範囲内に入るように縮小する。
// 事前にcreateVoiceFileEncodeSetting()を通したデータを入れること。
// size が undefined の場合は setting をそのまま返す。
export const resizeKyaraDateDisplay = (setting: outSettingType, size?: { w: number; h: number }): outSettingType => {
  // size がundefinedでないことを確認する。
  // undefined の場合は setting をそのまま返す。
  if (size !== undefined) {
    // 画像の横が長いか同じ場合は横の長さに合わせて縮小する
    if (setting.tatie.moviW.val >= setting.tatie.moviH.val) {
      const sizeAns = (size.w / setting.tatie.moviW.val) * setting.tatie.moviH.val
      setting.tatie.moviW.val = size.w
      setting.tatie.moviH.val = sizeAns

      console.log('縮小結果w: ' + setting.tatie.moviW.val + ' ' + setting.tatie.moviH.val)

      return setting

      // 画像の縦が長い場合は縦の長さに合わせて縮小する
    } else {
      const sizeAns = (size.h / setting.tatie.moviH.val) * setting.tatie.moviW.val
      setting.tatie.moviW.val = sizeAns
      setting.tatie.moviH.val = size.h

      console.log('縮小結果h: ' + setting.tatie.moviW.val + ' ' + setting.tatie.moviH.val)

      return setting
    }
  } else {
    return setting
  }
}
