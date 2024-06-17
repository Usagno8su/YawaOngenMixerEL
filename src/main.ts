import { app, BrowserWindow, ipcMain, IpcMainEvent, dialog, Menu, MenuItem } from 'electron'
import path from 'path'
import fs from 'fs'
import { createHash } from 'crypto'

import {
  initializationSetting,
  readVoiceDir,
  outSoftVersion,
  writeJsonData,
  readJsonData,
  makeUUID,
  initializationFileListTatie,
  enterEncodeVideoData,
  initializationGlobalSetting,
  loadDirPath,
  loadFilePath,
  initializationKyaraProfileList,
  CopyFileDataList,
  loadKyraPicFileData,
  enterEncodePicFileData,
  saveUint8ArrayFileData,
} from './utils/analysisMain'
import { createDefoInfoDateList } from './utils/analysisGeneral'
import { outSettingType, profileKyaraExportType, globalSettingExportType } from './type/data-type'
import { DEFAULT_KYARA_PROFILE_NAME } from './data/data'

// 各種ディレクトリのパスを作成
const configDirPathGLB = path.join(app.getPath('userData'), 'yomConfig') // メインディレクトリ
const globalSettingFilePathGLB = path.join(configDirPathGLB, 'GlobalSetting') // 全体設定保存用
const kyaraSettingDirPathGLB = path.join(configDirPathGLB, 'kyaraSetting') // 各種キャラ設定保存用
const kyaraTatieDirPathGLB = path.join(configDirPathGLB, 'kyaraTatie') // 立ち絵の保存用
const defoKyaraSettingJsonFileName = DEFAULT_KYARA_PROFILE_NAME // デフォルトで作成されるキャラ設定プロファイルのUUID
const defoTatieFileListName = 'tatiefile_db' // 立ち絵UUIDとファイル名のリストファイルの名前
const kyaraProfileListNameGLB = 'kyaraProfileListDB' // キャラ設定プロファイルの名前とUUIDを記録したDBファイルの名前

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  console.log('mainConfigPath: ' + configDirPathGLB)
  console.log('appDataPath: ' + kyaraSettingDirPathGLB)

  // ディレクトリ作成
  // 再帰的に作成してもいいが、今の所ひとつひとつ作成する。
  if (!fs.existsSync(configDirPathGLB)) {
    fs.mkdirSync(configDirPathGLB)
  }
  if (!fs.existsSync(kyaraSettingDirPathGLB)) {
    fs.mkdirSync(kyaraSettingDirPathGLB)
  }
  if (!fs.existsSync(kyaraTatieDirPathGLB)) {
    fs.mkdirSync(kyaraTatieDirPathGLB)
  }

  // 全体設定のファイルがない場合は作成する。
  if (!fs.existsSync(globalSettingFilePathGLB + '.json')) {
    // 全体設定を読み込んでJSON形式に変換
    const outSettingFile = JSON.stringify(initializationGlobalSetting(), undefined, 2)

    // 書き込み
    writeJsonData(globalSettingFilePathGLB, outSettingFile)
  }

  // キャラ設定プロファイルのリストがない場合は作成する。
  const kyaraProfileListFilePath = path.join(kyaraSettingDirPathGLB, kyaraProfileListNameGLB)
  if (!fs.existsSync(kyaraProfileListFilePath + '.json')) {
    // プロファイルリストを読み込んでJSON形式に変換
    const outSettingFile = JSON.stringify(initializationKyaraProfileList(), undefined, 2)

    // 書き込み
    writeJsonData(path.join(kyaraProfileListFilePath), outSettingFile)
  }

  // 初期に配置されているキャラ設定がない場合は 作成する。
  const defoKyaraSettingFilePath = path.join(kyaraSettingDirPathGLB, defoKyaraSettingJsonFileName)
  if (!fs.existsSync(defoKyaraSettingFilePath + '.json')) {
    // キャラ設定を読み込んでJSON形式に変換
    const outSettingFile = JSON.stringify(initializationSetting(), undefined, 2)

    // 書き込み
    writeJsonData(path.join(defoKyaraSettingFilePath), outSettingFile)
  }

  // 立ち絵UUIDとファイル名のリストファイルがない場合は作成する。
  const defoTatieFileListPath = path.join(kyaraTatieDirPathGLB, defoTatieFileListName)
  if (!fs.existsSync(defoTatieFileListPath + '.json')) {
    // キャラ設定を読み込んでJSON形式に変換
    const outTatieListFile = JSON.stringify(initializationFileListTatie(), undefined, 2)

    // 書き込み
    writeJsonData(path.join(defoTatieFileListPath), outTatieListFile)
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 910,
    resizable: false, // ウィンドウサイズ変更不可
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // メニューバーの設定
  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: '操作',
      submenu: [
        {
          label: '設定を保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (app.isReady()) {
              mainWindow.webContents.send('SaveSettingKeyCom')
            }
          },
        },
        {
          label: '全体設定',
          click: () => {
            if (app.isReady()) {
              mainWindow.webContents.send('openGlobalKeyCom')
            }
          },
        },
      ],
    }),
  )

  Menu.setApplicationMenu(menu)

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'bottom' })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('before-quit', () => {
  console.log('終了設定')
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('hashData', async (event: IpcMainEvent, data: string) => {
  console.log('メインデータ: ' + data)
  event.returnValue = parseInt(createHash('sha256').update(data).digest('hex'), 16)
})

// UUIDを作成して返す
ipcMain.on('newUUID', async (event: IpcMainEvent) => {
  event.returnValue = makeUUID()
})

// 動作環境がlinuxかWindowsか取得して返す
ipcMain.on('GetPlatformData', async (event: IpcMainEvent) => {
  event.returnValue = process.platform
})

// ソフトのバージョン情報をレンダラー側に渡す
ipcMain.on('SoftVersionData', async (event: IpcMainEvent) => {
  event.returnValue = outSoftVersion()
})

// キャラ設定プロファイルの読み込みを行う
ipcMain.on('loadKyaraProfileData', async (event: IpcMainEvent, file: string) => {
  // キャラ設定プロファイルのパスを作成
  const defoKyaraSettingFilePath = path.join(kyaraSettingDirPathGLB, file)

  // ファイルの読み込みを実行して、結果のデータを返す
  // 取得に失敗した場合はデフォルトデータを作成する
  try {
    if (fs.existsSync(defoKyaraSettingFilePath + '.json')) {
      const inputData: profileKyaraExportType = JSON.parse(readJsonData(defoKyaraSettingFilePath))
      event.returnValue = {
        infoSetting: inputData.infoSetting,
        settingList: inputData.settingList,
      }
    } else {
      throw new Error('読み込みエラー')
    }
  } catch (e) {
    event.returnValue = {
      infoSetting: createDefoInfoDateList(),
      settingList: <outSettingType[]>[],
    }
  }
})

// キャラ設定プロファイルの書き込みを行う
ipcMain.on('saveKyaraProfileData', async (event: IpcMainEvent, fileName: string, outJsonData?: string) => {
  try {
    // プロファイルを保存するディレクトリの、指定されたファイルに書き込みを実行
    // outJsonDataがない場合は新規にデータを作成して入れる
    const ans = writeJsonData(
      path.join(kyaraSettingDirPathGLB, fileName),
      outJsonData ?? JSON.stringify(initializationSetting(), undefined, 2),
    )

    event.returnValue = ans
  } catch (e) {
    console.log('main err: ' + e)
    event.returnValue = false
  }
})

// 音声ファイルの個別設定データの読み込みを行う
ipcMain.on('loadVoiceFileData', async (event: IpcMainEvent, dirPathName: string) => {
  event.returnValue = readJsonData(path.join(dirPathName, 'yomVoiceSetting'))
})

// 音声ファイルの個別設定データの書き込みを行う
ipcMain.on('saveVoiceFileData', async (event: IpcMainEvent, dirPathName: string, outJsonData: string) => {
  try {
    // 音声ファイルのあるディレクトリに、規定のファイルで書き込みを実行
    const ans = writeJsonData(path.join(dirPathName, 'yomVoiceSetting'), outJsonData)

    event.returnValue = ans
  } catch (e) {
    console.log('main err: ' + e)
    event.returnValue = false
  }
})

// 読み込むディレクトリを選択する
ipcMain.on('voiceDirOpen', async (event, defoDir?: string): Promise<void> => {
  // ディレクトリを選択
  const dir = await loadDirPath(defoDir, '音声ファイルのあるディレクトリ')

  // ディレクトリの内容を配列で出力する
  // 読み込みをキャンセルした場合は空とnullを返す
  if (dir !== null) {
    event.returnValue = [readVoiceDir(dir), dir]
  } else {
    event.returnValue = [[], null]
  }
})

// ディレクトリを選択して、そのパスを読み込む
ipcMain.on('loadDirPath', async (event, defoDir?: string, title?: string): Promise<void> => {
  event.returnValue = await loadDirPath(defoDir, title)
})

// ファイルを選択して、そのパスを読み込む
ipcMain.on(
  'loadFilePath',
  async (
    event,
    defoDir?: string,
    title?: string,
    filtersName?: string,
    filtersExtensions?: string[],
  ): Promise<void> => {
    event.returnValue = await loadFilePath(defoDir, title, filtersName, filtersExtensions)
  },
)

// 立ち絵の読み込みを行う
// fileNameに拡張子は入れないこと
ipcMain.on('loadKyraPicFileData', async (event: IpcMainEvent, fileName: string, sizeHeight?: number) => {
  // 全体設定を読み込んで、コマンドのパス情報を取得する。
  const globalSettingData: globalSettingExportType = JSON.parse(readJsonData(globalSettingFilePathGLB))

  event.returnValue = await loadKyraPicFileData(
    kyaraTatieDirPathGLB,
    fileName,
    globalSettingData.globalSetting.exeFilePath.convert,
    sizeHeight,
  )
})

// 立ち絵を読み込んで指定のディレクトリに保存する
ipcMain.on('selectSaveKyraPicFileData', async (event, defoDir?: string) => {
  // 選択画面で表示するディレクトリを決める
  const defaultPath = fs.existsSync(defoDir) ? defoDir : app.getPath('home')

  // pngファイルを選択
  // 複数選択可能
  const file = dialog.showOpenDialogSync(null, {
    title: '立ち絵ファイルを選択',
    defaultPath: defaultPath,
    buttonLabel: '読み込み',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['png'] }],
  })

  // ファイルを保存してUUIDを出力する
  // 読み込みをキャンセルした場合はnullを返す
  if (file !== undefined) {
    event.returnValue = await CopyFileDataList(file, kyaraTatieDirPathGLB)
  } else {
    event.returnValue = []
  }
})

// キャラUUIDリストの読み込みを行う
ipcMain.on('loadFileListKyaraData', async (event: IpcMainEvent) => {
  const defoTatieFileListPath = path.join(kyaraTatieDirPathGLB, defoTatieFileListName)
  event.returnValue = readJsonData(defoTatieFileListPath)
})

// キャラUUIDリストの書き込みを行う
ipcMain.on('saveFileListKyaraData', async (event: IpcMainEvent, outJsonData: string) => {
  const defoTatieFileListPath = path.join(kyaraTatieDirPathGLB, defoTatieFileListName)
  try {
    // 音声ファイルのあるディレクトリに、規定のファイルで書き込みを実行
    const ans = writeJsonData(defoTatieFileListPath, outJsonData)

    event.returnValue = ans
  } catch (e) {
    console.log('main err: ' + e)
    event.returnValue = false
  }
})

// 全体設定の読み込みを行う
ipcMain.on('loadGlobalSettingData', async (event: IpcMainEvent) => {
  event.returnValue = readJsonData(globalSettingFilePathGLB)
})

// 全体設定の書き込みを行う
ipcMain.on('saveGlobalSettingData', async (event: IpcMainEvent, outJsonData: string) => {
  try {
    // 音声ファイルのあるディレクトリに、規定のファイルで書き込みを実行
    const ans = writeJsonData(globalSettingFilePathGLB, outJsonData)

    event.returnValue = ans
  } catch (e) {
    event.returnValue = false
  }
})

// JSONファイルの読み込みを行う
// 内容を変数に戻すのはレンダラー側で行う
// どの種類のファイルを読み込むかは fileType で判定する
ipcMain.on('loadJsonString', async (event: IpcMainEvent, fileType: string, fileName?: string): Promise<void> => {
  switch (fileType) {
    case 'kyaraProfileData': // 指定されたキャラ設定プロファイル(fileNameの指定がない場合はデフォルトのファイル)
      event.returnValue = readJsonData(path.join(kyaraSettingDirPathGLB, fileName ?? DEFAULT_KYARA_PROFILE_NAME))
      break
    case 'kyaraProfileList': // キャラ設定プロファイルのリスト
      event.returnValue = readJsonData(path.join(kyaraSettingDirPathGLB, kyaraProfileListNameGLB))
      break
    case 'globalSetting': // 全体設定
      event.returnValue = readJsonData(globalSettingFilePathGLB)
      break
    default:
      break
  }
})

// JSONファイルの書き込みを行う
// JSON形式への変数はレンダラー側で行う
// どの種類のファイルを読み込むかは fileType で判定する
ipcMain.on(
  'saveJsonString',
  async (event: IpcMainEvent, fileType: string, outJsonData: string, fileName?: string): Promise<void> => {
    new Promise((resolve, reject) => {
      switch (fileType) {
        case 'kyaraProfileData': // 指定されたキャラ設定プロファイル(fileNameの指定がない場合はデフォルトのファイル)
          resolve(path.join(kyaraSettingDirPathGLB, fileName))
          break
        case 'kyaraProfileList': // キャラ設定プロファイルのリスト
          resolve(path.join(kyaraSettingDirPathGLB, kyaraProfileListNameGLB))
          break
        case 'globalSetting': // 全体設定
          resolve(globalSettingFilePathGLB)
          break
        default:
          reject()
          break
      }
    })
      .then((value: string) => {
        try {
          // 書き込みを実行
          const ans = writeJsonData(value, outJsonData)

          event.returnValue = ans
        } catch (e) {
          event.returnValue = false
        }
      })
      .catch((e) => {
        event.returnValue = false
      })
  },
)

// 動画のエンコードを行う
ipcMain.handle('enterEncodeVideoData', async (event: IpcMainEvent, dirPathName: string, outJsonData: string) => {
  // 全体設定を読み込んで、コマンドのパス情報を取得する。
  const globalSettingData: globalSettingExportType = JSON.parse(readJsonData(globalSettingFilePathGLB))

  return await enterEncodeVideoData(dirPathName, outJsonData, kyaraTatieDirPathGLB, globalSettingData.globalSetting)
})

// 画像エンコードのみを実施し、作成した画像ファイルとファイルパスを返す。
ipcMain.on('loadEncodePicFileData', async (event: IpcMainEvent, outJsonData: string) => {
  // 全体設定を読み込んで、コマンドのパス情報を取得する。
  const globalSettingData: globalSettingExportType = JSON.parse(readJsonData(globalSettingFilePathGLB))

  event.returnValue = await enterEncodePicFileData(outJsonData, kyaraTatieDirPathGLB, globalSettingData.globalSetting)
})

// 画像エンコードで作成したファイルを保存する処理を実行
ipcMain.handle(
  'saveUint8ArrayFileData',
  async (
    event,
    fileData: Uint8Array,
    fileName: string,
    fileFiltersName: string,
    fileFiltersExtensions: string[],
    defoDir?: string,
  ) => {
    return saveUint8ArrayFileData(fileData, fileName, fileFiltersName, fileFiltersExtensions, defoDir)
  },
)
