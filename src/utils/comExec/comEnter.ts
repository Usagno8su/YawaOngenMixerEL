// このファイルはメイン側で利用するため、レンダラー側では読み込めない
// 作成したコマンドを実行する
import type { createComImgType } from './comIMG'
import { outSettingType } from '../../type/data-type'
import path from 'path'
import fs from 'fs'
import * as child_process from 'child_process'
import * as util from 'util'
import { DEFAULT_KYARA_TATIE_UUID } from '../../data/data'
const sharp = require('sharp') // eslint-disable-line
import type { Metadata as SharpMetadata } from 'sharp'

const execFile = util.promisify(child_process.execFile)

type PicPathType = {
  inputTatie: string
  baseTempPic: string
  cnvBackPic: string
}

// FFmpeg のバージョン番号を取得する。
export const LoadFFmpegVersion = async (ffmpegPath: string): Promise<string[]> => {
  const ffmpegVer: string[] = await execFile(ffmpegPath, ['-version'])
    .then((value) => {
      return value.stdout.split(/\n/)[0].split(' ')[2].split('-')[0].split('.')
    })
    .catch((e) => {
      return e
    })
  if (ffmpegVer[0] === '') {
    return ['Error: ' + ffmpegVer.toString()]
  }
  return ffmpegVer
}

// 立ち絵画像を縮小する処理
// UUIDが DEFAULT_KYARA_TATIE_UUID なら存在しないので、処理を実行しない
export const resizeTatiePath = async (
  picFileName: string,
  inputTatie: string,
  tatieResizeCom: { tatieW: number; tatieH: number },
): Promise<Buffer> => {
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
    try {
      return await sharp(inputTatie).resize(tatieResizeCom.tatieW, tatieResizeCom.tatieH).png().toBuffer()
    } catch {
      return null
    }
  } else {
    return null
  }
}

// 画像作成コマンドを実行して、作成された画像ファイルの絶対パスを返す。
export const createImgFile = async (
  comList: createComImgType,
  voiceFileName: string,
  picFileName: string,
  kyaraTatieDirPath: string,
  outDir: string,
  tempDir: string,
): Promise<string> => {
  console.log('変換開始-----------------------------aa-')

  // 画像ファイルのパスを作成する
  const makePicPath = async (): Promise<PicPathType> => {
    return {
      inputTatie: path.join(kyaraTatieDirPath, picFileName + '.png'), // 立ち絵のUUIDから立ち絵のパスを作る
      baseTempPic: path.join(tempDir, 'basetemp.png'), // 動画の画面サイズの透明な画像
      cnvBackPic: path.join(outDir, voiceFileName), // 画面に立ち絵を合成したファイルのパス
    }
  }
  const picPath = await makePicPath()

  // 立ち絵画像の縮小
  const tempTatiePic = await resizeTatiePath(
    picFileName,
    picPath.inputTatie,
    comList.tatieResizeCom,
  )
  // 立ち絵ファイルがデフォルト（立ち絵なし）ではないときに、nullだったら処理失敗
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID && tempTatiePic === null) {
    return 'Error: '
  }

  // 動画の画面サイズの透明な画像を生成する
  const baseTempPic: Buffer = await sharp({
    create: {
      width: comList.baseTempPicCom.moviW,
      height: comList.baseTempPicCom.moviH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer()

  // 画面サイズの透明画像と立ち絵の画像を合成する
  // UUIDが DEFAULT_KYARA_TATIE_UUID なら存在しないので、画面サイズの透明画像のパスを返す
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
    // 縮小した立ち絵の幅と高さを取得
    const tatieMetadata = await sharp(tempTatiePic)
      .metadata()
      .then((metadata: SharpMetadata) => {
        return {
          width: metadata.width,
          height: metadata.height,
        }
      })

    // 透明な背景との合成を実行
    // 立ち絵のtopとleftの座標はi左上が基準となるため、
    // 基本位置に合わせて座標の数値を引いて、立ち絵中央を基準にしている。
    await sharp(baseTempPic)
      .composite([
        {
          input: tempTatiePic,
          top:
            comList.cnvBackPicmakeCom.top -
            (comList.cnvBackPicmakeCom.psition.height !== 0
              ? tatieMetadata.height / comList.cnvBackPicmakeCom.psition.height
              : 0),
          left:
            comList.cnvBackPicmakeCom.left -
            (comList.cnvBackPicmakeCom.psition.width !== 0
              ? tatieMetadata.width / comList.cnvBackPicmakeCom.psition.width
              : 0),
        },
      ])
      .toFile(picPath.cnvBackPic + '.png')

    // 合成した画像のパスを返す。
    return picPath.cnvBackPic + '.png'
  } else {
    // 立ち絵がない場合は透明な画像をtempディレクトリに出力して、そのパスを返す。
    await sharp(baseTempPic).toFile(picPath.baseTempPic)
    return picPath.baseTempPic
  }
}

// 動画作成コマンドを実行して、作成された動画ファイルの絶対パスを返す。
export const createMoviFile = async (
  ffmpegPath: string,
  moviData: string[],
  settingList: outSettingType,
  outDir: string,
  tempDirPath: string,
): Promise<string> => {
  // 出力動画ファイルのパスを作成する
  const makeMoviPath = async (): Promise<string> => {
    return path.join(outDir, settingList.fileName)
  }
  const outFilePath = await makeMoviPath()

  console.log(moviData.concat([outFilePath + '.webm']))

  // Windowsの場合は一旦コマンドを書き出して、Shift-JISに変換して実行する
  if (process.platform === 'win32') {
    console.log('win')
    const comTempPs1File = path.join(tempDirPath, 'encode_com_temp.txt')
    const comPs1File = path.join(tempDirPath, 'encode_com.ps1')
    const cnvBackPic = await new Promise((resolve) => {
      resolve(fs.writeFileSync(comTempPs1File, `&"${ffmpegPath}" ${moviData.join(' ')} "${outFilePath}.webm"`, 'utf-8'))
    })
      .then(async () => {
        // コマンドのファイルをShift-JISに変換
        return await execFile('powershell', [
          '-NoProfile',
          '-ExecutionPolicy',
          'Unrestricted',
          '-Command',
          'Get-Content',
          '-Encoding',
          'UTF8',
          `"${comTempPs1File}"`,
          '|',
          'Set-Content',
          `"${comPs1File}"`,
        ])
      })
      .then(async () => {
        // 実行
        return await execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Unrestricted', `"&'${comPs1File}'"`], {
          shell: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        })
      })
    if (cnvBackPic.stderr !== '') {
      console.error('cnvBackPic error c: ' + cnvBackPic.stderr.toString())
      return 'Error: ' + cnvBackPic.stderr.toString()
    } else {
      console.error('cnvBackPic ans: ' + cnvBackPic.stdout.toString())
    }
  } else {
    const cnvBackPic = await execFile(ffmpegPath, moviData.concat(`${outFilePath}.webm`))
      .then((value) => {
        console.error('cnvBackPic ans: ' + value)
        return value
      })
      .catch((e) => {
        console.error('cnvBackPic error b: ' + e)
        return e
      })
    if (cnvBackPic.stderr !== '') {
      console.error('cnvBackPic error c: ' + cnvBackPic.stderr.toString())
      return 'Error: ' + cnvBackPic.stderr.toString()
    }
  }
  return `"${outFilePath}.webm"`
}

// sizeHeight で指定した高さの立ち絵画像を生成してそのデータを返す。
// 失敗時にはnullを返す。
export const enterEncodeSmallTatie = async (
  kyaraTatieDirPath: string,
  picFileName: string,
  sizeHeight: number,
): Promise<Buffer> => {
  // 立ち絵画像の縮小
  const tempTatiePic = await resizeTatiePath(
    picFileName,
    path.join(kyaraTatieDirPath, picFileName + '.png'),
    { tatieW: null, tatieH: sizeHeight },
  )
  if (tempTatiePic === null) {
    return null
  }

  return tempTatiePic
}
