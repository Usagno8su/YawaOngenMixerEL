// メインプロセス側で呼び出して使用するライブラリ。
// レンダラー側（*.vue）から呼び出すとエラーになるので注意

import { initializationSettingData } from '../data/defoKyara'
import {
  createDefoKyaraDateList,
  createDefoInfoDateList,
  createDefoFileListTatie,
  createDefoKyaraProfileList,
  NowTimeData,
} from './analysisGeneral'
import { ref } from 'vue'
import { createHash, randomUUID } from 'crypto'
import {
  outSettingType,
  profileKyaraExportType,
  infoSettingType,
  fileListTatieExportType,
  encodeProfileSendReType,
  globalSettingExportType,
  globalSettingType,
  kyaraProfileListExportType,
  kyaraProfileListType,
  pathStatusType,
} from '../type/data-type'
import { DEFAULT_KYARA_PROFILE_NAME } from '../data/data'
import { createNewDateList } from './analysisData'
import { createComImg } from './comExec/comIMG'
import { createImgFile, createMoviFile } from './comExec/comEnter'
import { createComMovi } from './comExec/comMOVI'
import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

// 作業用のo一時ファイルを設置するディレクトリをi作成する。
export const createTempDir = (): string => {
  // temp領域に専用のディレクトリを作成してそのパスを返す。
  const yomTempRoot = path.join(app.getPath('temp'), 'YOMtempDir')
  // ディレクトリ作成
  if (!fs.existsSync(yomTempRoot)) {
    fs.mkdirSync(yomTempRoot)
  }
  console.log('tempディレクトリ: ' + yomTempRoot)

  return yomTempRoot
}

// dateListに新しいデータを入れる際に、他と衝突していないIDを作成する
// analysisDataにもあるが、レンダラー側用の設定になっていて使えないので、メインプロセスではこちらを使用すること
export const createMainNewDataID = (dateList: outSettingType[], newName: string): number => {
  let newID = <number>0

  newID = parseInt(createHash('sha256').update(newName).digest('hex'), 16) // 重ならないように現在時刻を追加

  // 同じIDが作られたら、現在時刻を加えて再作成、それでだめならエラー
  if (dateList.findIndex((e) => e.uuid === newID.toString()) !== -1) {
    newID = parseInt(
      createHash('sha256')
        .update(newName + new Date().getTime())
        .digest('hex'),
      16,
    ) // 重ならないように現在時刻を追加

    if (dateList.findIndex((e) => e.uuid === newID.toString()) !== -1) {
      return -1
    }
  }

  return newID
}

// 現在のアプリバージョンと、念の為、確認処理で処理で発生したエラー等の個数も合わせて入れる。
export const outSoftVersion = (): { softVer: [number, number, number]; exportStatus: number } => {
  // 現在のアプリバージョン番号を取得（x.y.z）
  const softVerString = app.getVersion()
  // console.log('Version: ' + softVerString)

  const softVerList = ref<(number | null)[]>([])
  const exportStatus = ref<number>(0)

  // バージョン番号を'.'で分割してから数値に変換する
  softVerString.split('.').map((e) => {
    if (Number.isNaN(e)) {
      exportStatus.value++
    }
    softVerList.value.push(parseInt(e))
  })
  return {
    softVer: [softVerList.value[0], softVerList.value[1], softVerList.value[2]],
    exportStatus: exportStatus.value,
  }
}

// キャラ設定の基本情報部分を作成する。
export const outInfoData = (): infoSettingType => {
  const outData = <infoSettingType>createDefoInfoDateList()

  try {
    // ビデオ用ディレクトリがあればその中にメインの保存ディレクトリを作成
    const videoDir = fs.existsSync(app.getPath('videos')) ? app.getPath('videos') : app.getPath('home')

    console.log('ビデオフォルダ: ' + videoDir)

    if (!fs.existsSync(videoDir)) throw new Error('ビデオディレクトリなし')

    const outMainDir = path.join(videoDir, 'YOM_file') // メインディレクトリ
    const outMovieDir = outMainDir
    const outPicDir = outMainDir

    // ディレクトリ作成
    if (!fs.existsSync(outMainDir)) {
      fs.mkdirSync(outMainDir)
    }
    if (!fs.existsSync(outMainDir)) throw new Error('メインディレクトリ作成失敗')

    if (!fs.existsSync(outMovieDir)) {
      fs.mkdirSync(outMovieDir)
    }
    if (!fs.existsSync(outMovieDir)) throw new Error('動画ディレクトリ作成失敗')

    if (!fs.existsSync(outPicDir)) {
      fs.mkdirSync(outPicDir)
    }
    if (!fs.existsSync(outPicDir)) throw new Error('画像ディレクトリ作成失敗')

    // 作成した情報を返す

    return {
      outDir: outMovieDir,
      outPicDir: outPicDir,
      cutHR: outData.cutHR,
    }
  } catch (e) {
    // 取得に失敗したら空で返す
    return outData
  }
}

// 初期の全体設定を作成する。
// これを元にjsonファイルを出力する
export const initializationGlobalSetting = (): globalSettingExportType => {
  // バージョン番号を取得
  const softVersion = outSoftVersion()

  return {
    softVer: softVersion.softVer,
    exportStatus: softVersion.exportStatus,
    globalSetting: {
      selectProfile: DEFAULT_KYARA_PROFILE_NAME,
      saveSearchString: true,
      exeFilePath: {
        ffmpeg:
          process.platform === 'win32'
            ? path.join(app.getPath('home'), 'lib', 'ffmpeg', 'bin', 'ffmpeg.exe')
            : '/usr/bin/ffmpeg',
        convert: process.platform === 'win32' ? 'magick' : '/usr/bin/convert',
      },
    },
  }
}

// 初期に配置されているキャラ設定プロファイルの名前とUUIDを記録したDB情報を作成する。
// これを元にjsonファイルを出力する
export const initializationKyaraProfileList = (): kyaraProfileListExportType => {
  // データを作成
  const outData = createDefoKyaraProfileList()

  // バージョン番号を取得
  const softVersion = outSoftVersion()

  return {
    softVer: softVersion.softVer,
    exportStatus: softVersion.exportStatus,
    kyaraProfileList: [outData],
  }
}

// 初期に配置されているキャラ設定を作成する。
// これを元にjsonファイルを出力する
export const initializationSetting = (): profileKyaraExportType => {
  // デフォルトキャラ設定を作成
  const outData = ref<outSettingType[]>([createDefoKyaraDateList(process.platform)])

  // initializationSettingDataのデータを記録する
  initializationSettingData.map((e) => {
    // キャラ名の設定
    outData.value.push(
      createNewDateList(
        'kyara',
        makeUUID(),
        e.kyaraName,
        undefined,
        {},
        { subColor: e.subColor, subOrdercr: e.subOrdercr, subBorderW: e.subBorderW },
        '',
        '',
        '',
      ),
    )

    // スタイル付きの設定も、存在する場合は入れていく、これにはフォントの色は指定しない
    if (e.kyaraStyle !== undefined) {
      e.kyaraStyle.map((ekyaraStyle) =>
        outData.value.push(createNewDateList('kyast', makeUUID(), e.kyaraName, ekyaraStyle, {}, {}, '', '', '')),
      )
    }
  })

  // バージョン番号を取得
  const softVersion = outSoftVersion()

  return {
    softVer: softVersion.softVer,
    exportStatus: softVersion.exportStatus,
    infoSetting: outInfoData(),
    settingList: outData.value,
  }
}

// 初期に配置されているキャラ設定を作成する。
// これを元にjsonファイルを出力する
export const initializationFileListTatie = (): fileListTatieExportType => {
  // バージョン番号を取得
  const softVersion = outSoftVersion()

  return {
    softVer: softVersion.softVer,
    exportStatus: softVersion.exportStatus,
    fileListTatie: [createDefoFileListTatie()],
  }
}

export const loadDirPath = async (defoDir?: string, title?: string): Promise<string> => {
  // defoDirで指定されたディレクトリが存在する場合は、
  // それを選択したフォルダ選択画面にする。
  const defaultPath = fs.existsSync(defoDir) ? defoDir : app.getPath('home')

  // ディレクトリを選択
  const dir = dialog.showOpenDialogSync(null, {
    title: title ?? 'ディレクトリを選択',
    defaultPath: defaultPath,
    buttonLabel: '読み込み',
    properties: ['openDirectory'],
  })

  // ディレクトリのパスを出力する
  // 読み込みをキャンセルした場合はnullを返す
  if (dir !== undefined) {
    return dir[0]
  } else {
    return null
  }
}

// ファイルを選択してそのパスを返す。
// filtersExtensionsで読み込む拡張子を選択できる
export const loadFilePath = async (
  defoDir?: string,
  title?: string,
  filtersName?: string,
  filtersExtensions?: string[],
): Promise<string> => {
  // defoDirで指定されたディレクトリが存在する場合は、
  // それを選択したフォルダ選択画面にする。
  const defaultPath = fs.existsSync(defoDir) ? defoDir : app.getPath('home')

  // ファイルを選択
  const dir = dialog.showOpenDialogSync(null, {
    title: title ?? 'ディレクトリを選択',
    defaultPath: defaultPath,
    buttonLabel: '読み込み',
    properties: ['openFile'],
    filters: [{ name: filtersName ?? 'File', extensions: filtersExtensions ?? [] }],
  })

  // ファイルのパスを出力する
  // 読み込みをキャンセルした場合はnullを返す
  if (dir !== undefined) {
    return dir[0]
  } else {
    return null
  }
}

// 指定のディレクトリを調べてファイルの名前を配列に出力する
export const readVoiceDir = (voidePath: string): Array<string> => {
  const outFileList: string[] = []

  // 指定されたディレクトリを調べる
  const dir = fs.readdirSync(voidePath, { encoding: 'utf8', withFileTypes: true })

  // ファイル名を記録
  dir.map((file) => {
    outFileList.push(file.name)
  })

  return outFileList
}

// 指定されたJSONデータを読み込んでその内容を返す
// ファイル名はフルパスで指定するが、拡張子「.json」はここで付与するので入れないこと
export const readJsonData = (filePath: string): string => {
  // 読み込みを実行
  try {
    // 読み込み
    const inJsonData = fs.readFileSync(filePath + '.json', 'utf-8')

    return inJsonData
  } catch (err) {
    console.log('error: ' + err)

    return null
  }
}

// JSONデータを指定されたファイルに書き込む
// ファイル名はフルパスで指定するが、拡張子「.json」はここで付与するので入れないこと
export const writeJsonData = (filePath: string, outJsonData: string): boolean => {
  // 結果を格納
  let ans = <boolean>false

  // 書き込みを実行
  try {
    // 書き込み
    fs.writeFileSync(filePath + '.json', outJsonData)

    ans = true
  } catch (err) {
    console.log('error: ' + err)

    ans = false
  }

  return ans
}

// 与えられた文字列からUUIDを作成する
export const makeUUID = (): string => {
  return NowTimeData('UNIX16') + '-' + randomUUID()
}

// 動画エンコードを実施
export const enterEncodeVideoData = async (
  voiceFileDirPath: string,
  outJsonData: string,
  kyaraTatieDirPath: string,
  globalSetting: globalSettingType,
): Promise<string> => {
  // JSONデータを変換
  const outSettingData: encodeProfileSendReType = JSON.parse(outJsonData)

  //// 画像ファイルの作成

  // ImageMagic用のコマンド作成
  const imgData = await createComImg(outSettingData.settingList)
  console.log('img ans ----------------------------------------')
  console.log(imgData)

  // 一時ファイルのディレクトリを作成してpathを取得
  const tempDirPath = createTempDir()

  // ImageMagicを実行
  const imgFilePath = await createImgFile(
    globalSetting.exeFilePath.convert,
    imgData,
    outSettingData.settingList.fileName,
    outSettingData.settingList.tatie.tatieUUID.val,
    kyaraTatieDirPath,
    outSettingData.infoSetting.outPicDir,
    tempDirPath,
  )

  console.log('main への返送結果: ' + imgFilePath)

  //// 動画ファイルの作成

  // FFmpeg用のコマンド作成
  const moviData = await createComMovi(
    outSettingData.settingList,
    imgFilePath,
    voiceFileDirPath,
    tempDirPath,
    globalSetting.exeFilePath.ffmpeg,
  )

  console.log('movi ans ----------------------------------------')
  console.log(moviData)

  // FFmpegを実行
  const moviFilePath = createMoviFile(
    globalSetting.exeFilePath.ffmpeg,
    moviData,
    outSettingData.settingList,
    outSettingData.infoSetting.outDir,
    tempDirPath,
  )

  return moviFilePath
}

// ファイルの絶対パス(配列)を取得して、それを指定のディレクトリにコピーする。
// UUIDと、元のファイル名（拡張なし）と、拡張子を出力する。
export const CopyFileDataList = async (
  fileName: string[],
  copDir: string,
): Promise<{ uuid: string; name: string; extname: string }[]> => {
  const ansList = <{ uuid: string; name: string; extname: string }[]>[]

  const copyFileSyncEnt = async (): Promise<void> => {
    for (const item of fileName) {
      const ansFileName = makeUUID()
      fs.copyFileSync(item, path.join(copDir, ansFileName + '.png'))
      ansList.push({
        uuid: ansFileName,
        name: path.basename(item, path.extname(item)),
        extname: path.extname(item).split('.')[1] ?? '',
      })
    }
  }

  await copyFileSyncEnt()

  return ansList
}

// ファイルのパスからファイル名や拡張子の情報を取得する。
export const getPathStatus = (filePath: string): pathStatusType => {
  return {
    dirname: path.dirname(filePath),
    basename: path.basename(filePath, path.extname(filePath)),
    extname: path.extname(filePath).split('.')[1] ?? '',
  }
}
