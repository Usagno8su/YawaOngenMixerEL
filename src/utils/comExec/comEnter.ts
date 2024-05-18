// このファイルはメイン側で利用するため、レンダラー側では読み込めない
// 作成したコマンドを実行する
import type { createComImgType } from './comIMG'
import { outSettingType } from '../../type/data-type'
import path from 'path'
import * as child_process from 'child_process'
import * as util from 'util'
import { DEFAULT_KYARA_TATIE_UUID } from '../../data/data'

const execFile = util.promisify(child_process.execFile)

// 画像作成コマンドを実行して、作成された画像ファイルの絶対パスを返す。
export const createImgFile = async (
  convertPath: string,
  comList: createComImgType,
  voiceFileName: string,
  picFileName: string,
  kyaraTatieDirPath: string,
  outDir: string,
  tempDir: string,
): Promise<string> => {
  console.log('変換開始-----------------------------aa-')

  // 画像ファイルのパスを作成する
  const makePicPath = async (): Promise<{
    inputTatie: string
    tempTatiePic: string
    baseTempPic: string
    cnvBackPic: string
  }> => {
    return {
      inputTatie: path.join(kyaraTatieDirPath, picFileName + '.png'), // 立ち絵のUUIDから立ち絵のパスを作る
      tempTatiePic: path.join(tempDir, 'pictemp.png'), // 立ち絵を縮小した立ち絵ファイル
      baseTempPic: path.join(tempDir, 'basetemp.png'), // 動画の画面サイズの透明な画像
      cnvBackPic: path.join(outDir, voiceFileName), // 画面に立ち絵を合成したファイルのパス
    }
  }
  const picPath = await makePicPath()

  // 立ち絵画像を縮小する処理
  // UUIDが DEFAULT_KYARA_TATIE_UUID なら存在しないので、処理を実行しない
  const resizeTatiePath = async (): Promise<{
    stdout: string
    stderr: string
  }> => {
    if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
      return await execFile(convertPath, [picPath.inputTatie].concat(comList.tatieResizeCom, [picPath.tempTatiePic]))
        .then((value) => {
          return value
        })
        .catch((e) => {
          return e
        })
    } else {
      return {
        stdout: '',
        stderr: '',
      }
    }
  }
  // 立ち絵画像の縮小
  const tempTatiePic = await resizeTatiePath()
  if (tempTatiePic.stderr !== '') {
    return 'Error: ' + tempTatiePic.stderr.toString()
  }

  // 動画の画面サイズの透明な画像を生成する
  const baseTempPic = await execFile(convertPath, comList.baseTempPicCom.concat([picPath.baseTempPic]))
    .then((value) => {
      return value
    })
    .catch((e) => {
      return e
    })
  if (baseTempPic.stderr !== '') {
    return 'Error: ' + baseTempPic.stderr.toString()
  }

  // 画面サイズの透明画像と立ち絵の画像を合成する
  // UUIDが DEFAULT_KYARA_TATIE_UUID なら存在しないので、画面サイズの透明画像のパスを返す
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
    const cnvBackPic = await execFile(
      convertPath,
      [picPath.baseTempPic, picPath.tempTatiePic]
        .concat(comList.cnvBackPicmakeCom)
        .concat([picPath.cnvBackPic + '.png']),
    )
      .then((value) => {
        return value
      })
      .catch((e) => {
        return e
      })
    if (cnvBackPic.stderr !== '') {
      return 'Error: ' + cnvBackPic.stderr.toString()
    }

    return picPath.cnvBackPic + '.png'
  } else {
    return picPath.baseTempPic
  }
}

// 動画作成コマンドを実行して、作成された動画ファイルの絶対パスを返す。
export const createMoviFile = async (
  ffmpegPath: string,
  moviData: string[],
  settingList: outSettingType,
  outDir: string,
): Promise<string> => {
  // 出力動画ファイルのパスを作成する
  const makeMoviPath = async (): Promise<string> => {
    return path.join(outDir, settingList.fileName)
  }
  const outFilePath = await makeMoviPath()

  console.log(moviData.concat([outFilePath + '.webm']))

  const cnvBackPic = await execFile(ffmpegPath, moviData.concat([outFilePath + '.webm']))
    .then((value) => {
      return value
    })
    .catch((e) => {
      return e
    })
  if (cnvBackPic.stderr !== '') {
    return 'Error: ' + cnvBackPic.stderr.toString()
  }

  return `"${outFilePath}.webm"`
}
