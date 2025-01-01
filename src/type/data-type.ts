// 立ち絵関連の設定
export type tatieSetting = {
  tatieUUID: statusString // 立ち絵のUUID
  waitTatieUUID: statusString // 待機中の立ち絵のUUID
  moviW: statusNumber // 画面の横
  moviH: statusNumber // 画面の縦
  tatieConp: statusBoolean // 立ち絵の加工をするか
  tatieSide: statustatieSide // 配置位置
  tatieHpx: statusNumber // 立ち絵の高さ
  tatiePwPs: statusNumber // 立ち絵を横に移動
  tatiePhPs: statusNumber // 立ち絵を縦に移動
  fps: statusNumber // フレームレート
}

// 字幕関連の設定
export type subtitleSetting = {
  subText: statusBoolean // 字幕を表示するかどうか
  fontsPath: statusString // フォントのパス
  subAlignment: statusSubAlignment // 文字を寄せる方向
  subAutoRt: statusBoolean // 自動改行を有効化
  subTextBord: statusBoolean // 文字のフチに色をつける
  subBG: statusBoolean // 字幕に背景色をつける
  subSize: statusNumber // フォントサイズ
  subTextSpaceSize: statusNumber // 背景色をつけない時の、文字下の空きスペース
  subColor: statusString //フォントカラー
  subOrdercr: statusString // フォントのフチの色
  subBorderW: statusNumber // フォント周りのフチの大きさ
  subBgcolor: statusString // 背景色
  subBgTr: statusNumber // 背景の透明度
  subTextUseVoiceFileName: statusBoolean // 字幕に音声ファイル名（拡張子を含む）をそのまま使うかどうか
  subChangeSta: statusBoolean // 字幕の一部を変更するかどうか
  subSideSpaceSize: statusNumber // 字幕の左右の余白
  nameTagStringDis: statusBoolean // 名札を表示するか
  nameTagString: statusString // 名札の内容
  nameTagH: statusNumber // 名札の高さを移動
  nameTagW: statusNumber // 名札の横軸を移動
}

// 基本設定
export type infoSettingType = {
  outDir: string // 動画出力先
  outPicDir: string // 画面サイズの画像保存先
  cutHR: boolean // 「-」を区切り文字として使うかどうか
}

// 立ち絵・字幕の各項目のタイプ
export type statusString = {
  val: string
  active: boolean
}
export type statusNumber = {
  val: number
  active: boolean
}
export type statusBoolean = {
  val: boolean
  active: boolean
}
export type statustatieSide = {
  val: tatieSideType
  active: boolean
}
export type statusSubAlignment = {
  val: subAlignmentSideType
  active: boolean
}

// 立ち絵の項目のタイプ
export type tatieSettingType =
  | 'tatieUUID'
  | 'waitTatieUUID'
  | 'moviW'
  | 'moviH'
  | 'tatieConp'
  | 'tatieSide'
  | 'tatieHpx'
  | 'tatiePwPs'
  | 'tatiePhPs'
  | 'fps'

// 字幕の項目のタイプ
export type subtitleSettingType =
  | 'subText'
  | 'fontsPath'
  | 'subAlignment'
  | 'subAutoRt'
  | 'subTextBord'
  | 'subBG'
  | 'subSize'
  | 'subTextSpaceSize'
  | 'subColor'
  | 'subOrdercr'
  | 'subBorderW'
  | 'subBgcolor'
  | 'subBgTr'
  | 'subTextUseVoiceFileName'
  | 'subChangeSta'
  | 'subSideSpaceSize'

// 情報タイプを指定
export type dataTextType = 'defo' | 'kyara' | 'kyast' | 'seid' | 'tatieOrder'

// 「基本情報」「立ち絵」「字幕」のどれか
export type selectedEditDataType = 'defo' | 'tatie' | 'subtitle' | 'tatieOrder'

// 立ち絵の会話中と待機中のUUIDが入った連想配列名
export type tatieSituationType = 'tatieUUID' | 'waitTatieUUID'

// 立ち絵の配置位置
export type tatieSideType =
  | 'NorthWest'
  | 'North'
  | 'NorthEast'
  | 'West'
  | 'Center'
  | 'East'
  | 'SouthWest'
  | 'South'
  | 'SouthEast'

// 字幕の文字列をどちらに寄せるか（左 右 中央）
export type subAlignmentSideType = 'Left' | 'Right' | 'Center' | null

// キャラ名とスタイル名のみ
export type editKyaraNameType = {
  name: string
  kyaraStyle: string
}

// 設定をひとつにまとめたtype
export type outSettingType = {
  // キャラクターや音声のIDのリスト
  // それがどの動画出力設定を使用しているか記録する。
  dataType: dataTextType // 情報のタイプ
  uuid: string // データUUID
  name: string // キャラ名やIDが入る。defoはなし
  kyaraStyle: string // キャラのスタイルが入る。defoはなし
  // 立ち絵と字幕の設定
  tatie: tatieSetting
  subtitle: subtitleSetting
  fileName: string // ファイル名（拡張子なし）(seidの音声ファイル用)
  fileExtension: string // ファイル拡張子     (seidの音声ファイル用)
  voiceID: string // ID                       (seidの音声ファイル用)
}

// 各情報タイプで選択していたキャラのID情報を記録
export type beforeKyaraSelectType = {
  selectedKyaraIndex: number
  selectedEditData: selectedEditDataType // 「基本情報」「立ち絵」「字幕」のどれを表示していたかも記録
}

// 初期に配置されているキャラ設定を作るためType
export type initializationSettingType = {
  kyaraName: string
  subColor?: string //フォントカラー
  subOrdercr?: string // フォントのフチの色
  subBorderW?: number
  kyaraStyle?: string[]
}

// キャラ設定プロファイルをJSONファルに出力するために、
// 出力時のソフトのバージョンと出力エラーの有無を記録するType
export type profileKyaraExportType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  infoSetting: infoSettingType
  tatieOrderList: tatieOrderListType[]
  settingList: outSettingType[]
}

// 音声ファイルの個別設定データをJSONファルに出力するために、
// 出力時のソフトのバージョンと出力エラーの有無を記録するType
export type profileVoiceFileExportType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  settingList: outSettingType[]
}

// JSONファイルから読み込んだデータをメインからレンダラー側へ送るためのType
export type inputProfileSendReType = {
  infoSetting: infoSettingType
  tatieOrderList: tatieOrderListType[]
  settingList: outSettingType[]
}

// 立ち絵のファイルUUIDとそのファイル名のリストを作るためのType
export type fileListTatieType = {
  uuid: string
  fileName: string
  kyaraName: string
  commonsID: string
  memo: string
}

// 全体設定の内容を記録するType
export type globalSettingType = {
  selectProfile: string // 最後に開いていた設定プロファイルの名前
  saveSearchString: boolean // 検索欄への入力を別タブに行っても保存するか
  exeFilePath: {
    ffmpeg: string
    convert: string
  }
  useSubText: boolean // 音声ファイルリストで字幕の内容を表示するかどうか
}

// var 0.2.1 以下の場合
// useSubText がない
export type globalSettingV021Type = {
  selectProfile: string // 最後に開いていた設定プロファイルの名前
  saveSearchString: boolean // 検索欄への入力を別タブに行っても保存するか
  exeFilePath: {
    ffmpeg: string
    convert: string
  }
}

// キャラ設定プロファイルの名前とUUIDのリスト
export type kyaraProfileListType = {
  uuid: string // ファイル名（拡張子.jsonは入れない）
  displayName: string // プロファイルの表示名
}

// kyaraProfileListTypeを記録するJSONファイルを作るためのType
export type kyaraProfileListExportType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  kyaraProfileList: kyaraProfileListType[]
}

export type fileListTatieExportType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  fileListTatie: fileListTatieType[]
}

// 全体設定のJSONファイルを読み込んでバージョンを確認するType
export type globalSettingExportTempType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  globalSetting: string
}

// 全体設定のJSONファイルを作るためのType
export type globalSettingExportType = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  globalSetting: globalSettingType
}

// var 0.2.1 以下の全体設定JSONファイルを読み込むType
export type globalSettingExportV021Type = {
  softVer: [number, number, number] // バージョン番号を数値の配列にする
  exportStatus: number // 出力エラーがあると0ではなくなる（増える）
  globalSetting: globalSettingV021Type
}

// パスからファイル名等の情報を取り出すためのType
export type pathStatusType = {
  dirname: string // 親ディレクトリ名
  basename: string // ファイル名
  extname: string // 拡張子
}

// 立ち絵の表示順番を記録する配列の型
export type tatieOrderListType = {
  uuid: string
  dataType: dataTextType
  name: string
  kyaraStyle: string
  tatieSituation: tatieSituationType
}
