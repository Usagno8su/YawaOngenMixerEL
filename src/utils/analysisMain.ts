// メインプロセス側で呼び出して使用するライブラリ。
// レンダラー側（*.vue）から呼び出すとエラーになるので注意

import { initializationSettingData } from '../data/defoKyara'
import {
  createDefoKyaraDateList,
  createDefoInfoDateList,
  createDefoFileListTatie,
  createDefoKyaraProfileList,
  NowTimeData,
  createNewDateList,
} from './analysisGeneral'
import { ref } from 'vue'
import { createHash, randomUUID } from 'crypto'
import {
  outSettingType,
  profileKyaraExportType,
  infoSettingType,
  fileListTatieExportType,
  globalSettingExportType,
  globalSettingType,
  kyaraProfileListExportType,
  pathStatusType,
  globalSettingExportTempType,
  globalSettingExportV021Type,
  globalSettingV021Type,
  profileVoiceFileExportType,
  tatieOrderListType,
  tatieSituationType,
} from '../type/data-type'
import { DEFAULT_KYARA_PROFILE_NAME, DEFAULT_KYARA_TATIE_UUID } from '../data/data'
import { createComImg } from './comExec/comIMG'
import { createImgFile, createMoviFile, enterEncodeSmallTatie, imgCompositeFile } from './comExec/comEnter'
import { createComMovi } from './comExec/comMOVI'
import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

// 作業用の一時ファイルを設置するディレクトリを作成する。
export const createTempDir = async (): Promise<string> => {
  const makeTempDir = async (dir: string) => {
    fs.mkdirSync(dir)
  }

  // temp領域に専用のディレクトリを作成してそのパスを返す。
  const yomTempRoot = path.join(app.getPath('temp'), 'YOMtempDir')

  // ディレクトリがあるか確認する
  new Promise((resolve) => {
    resolve(fs.existsSync(yomTempRoot))
  }).then(async (value: boolean) => {
    if (!value) {
      // ディレクトリ作成
      await makeTempDir(yomTempRoot)
    }
  })

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

    // if (!fs.existsSync(outPicDir)) {
    //   fs.mkdirSync(outPicDir)
    // }
    // if (!fs.existsSync(outPicDir)) throw new Error('画像ディレクトリ作成失敗')

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
        convert:
          process.platform === 'win32'
            ? path.join(app.getPath('home'), 'lib', 'ImageMagick', 'magick.exe')
            : '/usr/bin/convert',
      },
      useSubText: true,
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
        process.platform,
        'kyara',
        makeUUID(),
        e.kyaraName,
        undefined,
        {},
        { subColor: e.subColor, subOrdercr: e.subOrdercr, subBorderW: e.subBorderW },
        '',
        '',
        '',
        undefined,
        false,
      ),
    )

    // スタイル付きの設定も、存在する場合は入れていく、これにはフォントの色は指定しない
    if (e.kyaraStyle !== undefined) {
      e.kyaraStyle.map((ekyaraStyle) =>
        outData.value.push(
          createNewDateList(
            process.platform,
            'kyast',
            makeUUID(),
            e.kyaraName,
            ekyaraStyle,
            {},
            {},
            '',
            '',
            '',
            undefined,
            false,
          ),
        ),
      )
    }
  })

  // バージョン番号を取得
  const softVersion = outSoftVersion()

  return {
    softVer: softVersion.softVer,
    exportStatus: softVersion.exportStatus,
    infoSetting: outInfoData(),
    tatieOrderList: [],
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

// 画像エンコードを実施します。
// 実行後に作成した画像ファイルの絶対パスを返します。
// エラーがあった場合は undefined を返します。
// fileName が指定されていた場合は、画像ファイル名はそれにする。
export const enterEncodeImageData = async (
  settingList: outSettingType,
  tatieSituation: tatieSituationType,
  tempDirPath: string,
  convertPath: string,
  kyaraTatieDirPath: string,
  outPicDir: string,
  fileName?: string,
): Promise<string> => {
  // ImageMagic用のコマンド作成
  const imgData = await createComImg(settingList)
  console.log('img ans ----------------------------------------')
  console.log(imgData)

  // ImageMagicを実行
  // 作成したファイルのパスを返す
  return await createImgFile(
    convertPath,
    imgData,
    fileName || settingList.fileName,
    settingList.tatie[tatieSituation].val,
    kyaraTatieDirPath,
    outPicDir,
    tempDirPath,
  )
}

// 動画エンコードを実施
export const enterEncodeVideoData = async (
  voiceFileDirPath: string,
  outJsonData: string,
  outTatieState: { outJsonData: string; tatieSituation: string }[],
  infoSettingJsonData: string,
  kyaraTatieDirPath: string,
  globalSetting: globalSettingType,
): Promise<string> => {
  // JSONデータを変換
  const settingList: outSettingType = JSON.parse(outJsonData)
  const infoSetting: infoSettingType = JSON.parse(infoSettingJsonData)

  // 一時ファイルのディレクトリを作成してpathを取得
  const tempDirPath = await createTempDir()

  //// 画像ファイルの作成

  // 画像ファイルの作成を実行
  const imgFilePath = await enterEncodePicFileData(outTatieState, kyaraTatieDirPath, globalSetting)

  console.log('main への返送結果: ' + imgFilePath)

  //// 動画ファイルの作成

  // FFmpeg用のコマンド作成
  const moviData = await createComMovi(
    settingList,
    imgFilePath.path,
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
    settingList,
    infoSetting.outDir,
    tempDirPath,
  )

  return moviFilePath
}

// 画像エンコードのみを実施し、作成した画像ファイルとファイルパスを返す。
export const enterEncodePicFileData = async (
  outState: { outJsonData: string; tatieSituation: string }[],
  kyaraTatieDirPath: string,
  globalSetting: globalSettingType,
): Promise<{ buffer: Uint8Array; path: string }> => {
  // 一時ファイルのディレクトリを作成してpathを取得
  const tempDirPath = await createTempDir()

  console.log('長さ; ' + outState.length)

  const imgList: string[] = []
  let kazu = 0
  for (const item of outState) {
    // outJsonDataの中身があるか確認して処理を実行する。
    if (item?.outJsonData !== undefined) {
      const setting: outSettingType = JSON.parse(item.outJsonData)
      console.log('変換: ' + setting.name + ', ' + kazu)
      const tatieSituation: tatieSituationType = item?.tatieSituation === 'tatieUUID' ? 'tatieUUID' : 'waitTatieUUID'

      if (fs.existsSync(path.join(kyaraTatieDirPath, setting.tatie[tatieSituation].val + '.png'))) {
        //// 画像ファイルの作成

        // 画像ファイルの作成を実行
        imgList.push(
          await enterEncodeImageData(
            setting,
            tatieSituation,
            tempDirPath,
            globalSetting.exeFilePath.convert,
            kyaraTatieDirPath,
            tempDirPath,
            'tb_' + kazu,
          ),
        )
        kazu += 1
      }
    }
  }

  console.log('imgList: ' + imgList[0] + ' ' + imgList[1] + ' ' + imgList[2])
  console.log('imgList:ここまで ')

  // 立ち絵が一つだけの場合はそのまま返す。
  if (imgList.length === 1) {
    // 作成したファイルを返す
    console.log('ひとつだけ')
    const buffer = await fs.promises.readFile(imgList[0])
    return {
      buffer: new Uint8Array(buffer),
      path: imgList[0],
    }
  } else if (imgList.length > 1) {
    console.log('ふくすう')
    // 2つ以上の場合は合成する。
    const ansPath = await imgCompositeFile(
      globalSetting.exeFilePath.convert,
      imgList,
      tempDirPath,
      'tenpCompositeMoveSizePic',
    )
    // 作成したファイルを返す
    const buffer = await fs.promises.readFile(ansPath)
    return {
      buffer: new Uint8Array(buffer),
      path: ansPath,
    }
  } else {
    // 立ち絵がない場合はnullのデータを返す。
    return {
      buffer: null,
      path: 'NoFile',
    }
  }
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

// 立ち絵画像ファイルを読み込む
// 縮小した画像ファイルが欲しい場合は、sizeHeightに高さを入れる。
export const loadKyraPicFileData = async (
  kyaraTatieDirPath: string,
  picFileName: string,
  convertPath?: string,
  sizeHeight?: number,
): Promise<Uint8Array> => {
  // 立ち絵ファイルが存在するか確認する。
  if (fs.existsSync(path.join(kyaraTatieDirPath, picFileName + '.png'))) {
    // 縮小した画像ファイルが欲しい場合
    if (sizeHeight !== undefined) {
      // 縮小ファイルがない場合は作成する。
      new Promise((resolve) => {
        resolve(fs.existsSync(path.join(kyaraTatieDirPath, picFileName + '_' + sizeHeight.toString() + '.png')))
      }).then(async (value: boolean) => {
        if (!value) {
          await enterEncodeSmallTatie(kyaraTatieDirPath, picFileName, convertPath, sizeHeight)
        }
      })
      // 作成したファイルを返す
      const buffer = await fs.promises.readFile(
        path.join(kyaraTatieDirPath, picFileName + '_' + sizeHeight.toString() + '.png'),
      )
      return new Uint8Array(buffer)
    } else {
      const buffer = await fs.promises.readFile(path.join(kyaraTatieDirPath, picFileName + '.png'))
      return new Uint8Array(buffer)
    }
  } else {
    return null
  }
}

// Uint8Arrayバイナリファイルを保存する
// 保存が完了したら保存したディレクトリを返す。
export const saveUint8ArrayFileData = (
  fileData: Uint8Array,
  fileName: string,
  fileFiltersName: string, // 対象ファイルの種類名
  fileFiltersExtensions: string[], // 対象ファイルの拡張子
  defoDir?: string,
): string => {
  // 選択画面で表示するディレクトリを決める
  const defaultPath = fs.existsSync(defoDir) ? defoDir : app.getPath('home')

  // デフォルトのファイル名とディレクトリパスを結合する。
  const defaultFilePath = path.join(defaultPath, fileName)

  // 保存場所を選択
  const savePath = dialog.showSaveDialogSync(null, {
    title: '保存場所を選択',
    defaultPath: defaultFilePath,
    buttonLabel: '保存',
    filters: [{ name: fileFiltersName, extensions: fileFiltersExtensions }],
  })

  // ファイルを保存して保存したディレクトリを出力する
  // 保存をキャンセルした場合はnullを返す
  if (savePath !== undefined) {
    const dirName = path.dirname(savePath)

    try {
      fs.writeFileSync(savePath, fileData)
      return dirName
    } catch {
      return null
    }
  } else {
    return null
  }
}

// 指定された字幕テキストファイルの内容を取得して返す。
// ファイルがない場合はfalseを返す。
export const loadSubTextString = (dir: string, fileName: string): { val: string; active: boolean } => {
  const fileFullPath = path.join(dir, fileName + '.txt')

  // 字幕テキストファイルが存在するか確認して読み込む。
  if (fs.existsSync(fileFullPath)) {
    const ans = fs.readFileSync(fileFullPath, 'utf-8')
    return { val: ans, active: true }
  } else {
    return { val: null, active: false }
  }
}

// 指定されたUUIDとファイル名のリストを調べて、同一ファイル名の字幕テキストファイルの内容を取得して返す。
// 返すときはUUIDをキーとした連想配列にする。
// ファイルがない場合はfalseを返す。
export const loadSubTextStringList = async (
  dir: string,
  itemList: { uuid: string; fileName: string }[],
): Promise<{ [key: string]: { val: string; active: boolean } }> => {
  const subList: { [key: string]: { val: string; active: boolean } } = {}
  for await (const item of itemList) {
    subList[item.uuid] = loadSubTextString(dir, item.fileName)
  }
  return subList
}

// 全体設定を読み込み、 設定が古い場合は、内容を更新する。
export const loadGlobalSettingData = async (confPath: string): Promise<string> => {
  const jsonData = ref<string>(readJsonData(confPath))

  // JSONファイル読み込み
  const inputJsonData: globalSettingExportTempType = JSON.parse(jsonData.value)

  ///////
  // 古い設定ファイルだった場合、必要な項目を追加します。

  // var 0.2.1 以下の場合
  // useSubText がないので追加する
  await new Promise((resolve, reject) => {
    if (inputJsonData.softVer[0] <= 0 && inputJsonData.softVer[1] <= 2 && inputJsonData.softVer[2] <= 1) {
      console.log('var 0.2.1 以下の場合')
      const inputJsonV021Data: globalSettingExportV021Type = JSON.parse(jsonData.value)
      resolve(inputJsonV021Data.globalSetting)
    } else {
      reject()
    }
  })
    .then((result: globalSettingV021Type) => {
      console.log('追加したデータを書き込む')
      // 追加したデータを書き込む
      const out = outSoftVersion()
      return JSON.stringify(
        {
          exportStatus: out.exportStatus,
          softVar: out.softVer,
          globalSetting: {
            ...result,
            useSubText: true,
          },
        },
        undefined,
        2,
      )
    })
    .then((result: string) => {
      return writeJsonData(confPath, result)
    })
    .then(() => {
      console.log('再読込')
      jsonData.value = readJsonData(confPath)
    })
    .catch(() => {
      console.log('問題なし')
    })

  return jsonData.value
}

// キャラ設定プロファイルを読み込み、 設定が古い場合は、内容を更新する。
export const loadKyaraProfileData = async (confPath: string): Promise<string> => {
  const jsonData = ref<string>(readJsonData(confPath))

  const inputJsonData: profileKyaraExportType = JSON.parse(jsonData.value)

  ///////
  // 古い設定ファイルだった場合、必要な項目を追加します。

  // var 0.2 以下の場合
  // waitTatieUUID と tatieOrderList がないので追加する
  await new Promise((resolve, reject) => {
    if (inputJsonData.softVer[0] <= 0 && inputJsonData.softVer[1] <= 2) {
      console.log('var 0.2 以下の場合')
      resolve('waitTatieUUID')
    } else {
      reject()
    }
  })
    .then(() => {
      // 追加したデータを書き込む
      const out = outSoftVersion()
      const tatieOrder: tatieOrderListType[] = []
      return JSON.stringify(
        {
          softVar: out.softVer,
          exportStatus: out.exportStatus,
          infoSetting: inputJsonData.infoSetting,
          tatieOrderList: tatieOrder,
          settingList: inputJsonData.settingList.map((item) => {
            return {
              dataType: item.dataType,
              uuid: item.uuid,
              name: item.name,
              kyaraStyle: item.kyaraStyle,
              tatie: {
                ...item.tatie,
                waitTatieUUID: {
                  val: DEFAULT_KYARA_TATIE_UUID,
                  active: item.dataType === 'defo' ? true : false,
                },
              },
              subtitle: item.subtitle,
              fileName: item.fileName,
              fileExtension: item.fileExtension,
              voiceID: item.voiceID,
              fileTatieOrderList: { val: tatieOrder, active: false },
              fileActive: false,
            }
          }),
        },
        undefined,
        2,
      )
    })
    .then((result: string) => {
      return writeJsonData(confPath, result)
    })
    .then(() => {
      console.log('再読込')
      jsonData.value = readJsonData(confPath)
    })
    .catch(() => {
      console.log('問題なし')
    })

  return jsonData.value
}

// 音声ファイルの個別設定データを読み込み、 設定が古い場合は、内容を更新する。
export const loadVoiceFileData = async (confPath: string): Promise<string> => {
  const jsonData = ref<string>(readJsonData(confPath))

  const inputJsonData: profileVoiceFileExportType = JSON.parse(jsonData.value)

  ///////
  // 古い設定ファイルだった場合、必要な項目を追加します。

  // var 0.2 以下の場合
  // waitTatieUUID と tatieOrderList がないので追加する
  await new Promise((resolve, reject) => {
    if (inputJsonData.softVer[0] <= 0 && inputJsonData.softVer[1] <= 2) {
      console.log('var 0.2 以下の場合')
      resolve('waitTatieUUID')
    } else {
      reject()
    }
  })
    .then(() => {
      // 追加したデータを書き込む
      const out = outSoftVersion()
      const tatieOrder: tatieOrderListType[] = []
      return JSON.stringify(
        {
          softVar: out.softVer,
          exportStatus: out.exportStatus,
          settingList: inputJsonData.settingList.map((item) => {
            return {
              dataType: item.dataType,
              uuid: item.uuid,
              name: item.name,
              kyaraStyle: item.kyaraStyle,
              tatie: {
                ...item.tatie,
                waitTatieUUID: {
                  val: DEFAULT_KYARA_TATIE_UUID,
                  active: item.dataType === 'defo' ? true : false,
                },
              },
              subtitle: item.subtitle,
              fileName: item.fileName,
              fileExtension: item.fileExtension,
              voiceID: item.voiceID,
              fileTatieOrderList: { val: tatieOrder, active: false },
              fileActive: false,
            }
          }),
        },
        undefined,
        2,
      )
    })
    .then((result: string) => {
      return writeJsonData(confPath, result)
    })
    .then(() => {
      console.log('再読込')
      jsonData.value = readJsonData(confPath)
    })
    .catch(() => {
      console.log('問題なし')
    })

  return jsonData.value
}
