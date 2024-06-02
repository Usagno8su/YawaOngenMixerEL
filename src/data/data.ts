import { tatieSideType, subAlignmentSideType } from '../type/data-type'

// 必要な変数を作成する
//

//// 各種デフォルトの名前を設定

// デフォルトのキャラ設定プロファイル名
export const DEFAULT_KYARA_PROFILE_NAME = 'default'

// デフォルトのキャラ設定につけるUUID
export const DEFAULT_KYARA_SETTING_UUID = '0'

// デフォルトの立ち絵のUUID
export const DEFAULT_KYARA_TATIE_UUID = '0'

// Windowsのデフォルトフォント
export const DEFAULT_FONT_WIN = 'C:\\Windows\\Fonts\\BIZ-UDGothicB.ttc'

// Linuxのデフォルトフォント
export const DEFAULT_FONT_LINUX = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'

export const tatieSideView: { [key in tatieSideType]: string } = {
  NorthWest: '上段左',
  North: '上段中央',
  NorthEast: '上段右',
  West: '中段左',
  Center: '中段中央',
  East: '中段右',
  SouthWest: '下段左',
  South: '下段中央',
  SouthEast: '下段右',
}

export const subAlignmentView: { [key in subAlignmentSideType]: string } = {
  Left: '左寄せ',
  Right: '右寄せ',
  Center: '中央寄せ',
}

// 各キャラ設定タイプの色を決定する
export const typeColor: { [key: string]: { bg: string; hoverBG: string; hoverText: string } } = {
  defo: {
    bg: 'bg-blue-200',
    hoverBG: 'bg-blue-500',
    hoverText: 'text-gray-300',
  },
  kyara: {
    bg: 'bg-emerald-400',
    hoverBG: 'bg-emerald-600',
    hoverText: 'text-gray-200',
  },
  kyast: {
    bg: 'bg-red-300',
    hoverBG: 'bg-red-500',
    hoverText: 'text-gray-200',
  },
  seid: {
    bg: 'bg-orange-300',
    hoverBG: 'bg-orange-500',
    hoverText: 'text-gray-200',
  },
}

// 立ち絵の項目リスト
export const tatieSettingList = [
  'tatiePath',
  'moviW',
  'moviH',
  'tatieConp',
  'tatieSide',
  'tatieHpx',
  'tatiePwPs',
  'tatiePhPs',
  'fps',
]

// 字幕の項目のタイプ
export const subtitleSettingList = [
  'subText',
  'fontsPath',
  'subAlignment',
  'subAutoRt',
  'subTextBord',
  'subBG',
  'subSize',
  'subTextSpaceSize',
  'subColor',
  'subOrdercr',
  'subBorderW',
  'subBgcolor',
  'subBgTr',
  'subTextUseVoiceFileName',
  'subChangeSta',
  'subSideSpaceSize',
  'nameTagStringDis',
  'nameTagString',
  'nameTagH',
  'nameTagW',
]
