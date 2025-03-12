// メインプロセス・レンダラー側双方で使用するライブラリ。

import { createNewDateList, createNewFileListTatie } from './analysisData'
import { outSettingType, infoSettingType, fileListTatieType, kyaraProfileListType } from '../type/data-type'
import {
  DEFAULT_KYARA_TATIE_UUID,
  DEFAULT_KYARA_PROFILE_NAME,
  DEFAULT_KYARA_SETTING_UUID,
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
    displayName: 'デフォルト',
  }
}

// デフォルトのキャラ設定データを作成して返す
export const createDefoKyaraDateList = (platform?: NodeJS.Platform): outSettingType => {
  return createNewDateList(
    'defo',
    DEFAULT_KYARA_SETTING_UUID,
    'デフォルト',
    undefined,
    {
      tatieUUID: DEFAULT_KYARA_TATIE_UUID,
      waitTatieUUID: DEFAULT_KYARA_TATIE_UUID,
      moviW: 1280,
      moviH: 720,
      tatieConp: true,
      tatieSide: 'SouthEast',
      tatieHpx: 40,
      tatiePwPs: 0,
      tatiePhPs: 0,
      fps: 2,
    },
    {
      subText: true,
      fontsPath: platform === 'win32' ? DEFAULT_FONT_WIN : DEFAULT_FONT_LINUX,
      subAlignment: 'Center',
      subAutoRt: true,
      subTextBord: true,
      subBG: false,
      subSize: 38,
      subTextSpaceSize: 10,
      subColor: '#ffffff',
      subOrdercr: '#000000',
      subBorderW: 2,
      subBgcolor: '#0000ff',
      subBgTr: 0.7,
      subTextUseVoiceFileName: false,
      subChangeSta: false,
      subSideSpaceSize: 5,
    },
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
