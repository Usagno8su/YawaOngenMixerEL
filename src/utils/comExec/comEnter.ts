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
import type { Metadata as SharpMetadata, Sharp, OutputInfo, CacheOptions } from 'sharp'
import { pipeline } from 'stream/promises'

const execFile = util.promisify(child_process.execFile)

type PicPathType = {
  inputTatie: string
  tempTatiePic: string
  tempTatieTriPic: string
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
  tempTatiePic: string,
  tatieResizeCom: { tatieW: number; tatieH: number },
): Promise<string> => {
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
    const readStream = fs.createReadStream(inputTatie)
    const writeStream = fs.createWriteStream(tempTatiePic)
    const sharpData = sharp().resize(tatieResizeCom.tatieW, tatieResizeCom.tatieH).png()

    await pipeline(readStream, sharpData, writeStream)
    return tempTatiePic
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
  console.log(`変換開始-----------------------------aa-`)
  sharp.cache({ memory: 100, files: 40, items: 200 })

  // 画像ファイルのパスを作成する
  const makePicPath = async (): Promise<PicPathType> => {
    return {
      inputTatie: path.join(kyaraTatieDirPath, picFileName + '.png'), // 立ち絵のUUIDから立ち絵のパスを作る
      tempTatiePic: path.join(tempDir, 'pictemp.png'), // 立ち絵を縮小した立ち絵ファイル
      tempTatieTriPic: path.join(tempDir, 'pictemp2.png'), // トリミングした立ち絵ファイル
      baseTempPic: path.join(tempDir, 'basetemp.png'), // 動画の画面サイズの透明な画像
      cnvBackPic: path.join(outDir, voiceFileName), // 画面に立ち絵を合成したファイルのパス
    }
  }
  const picPath = await makePicPath()

  // 立ち絵画像の縮小
  const tempTatiePic = await resizeTatiePath(
    picFileName,
    picPath.inputTatie,
    picPath.tempTatiePic,
    comList.tatieResizeCom,
  )
  // 立ち絵ファイルがデフォルト（立ち絵なし）ではないときに、nullだったら処理失敗
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID && tempTatiePic === null) {
    return 'Error: '
  }
  console.log('動画の画面サイズの透明な画像を生成する')
  // 動画の画面サイズの透明な画像を生成する
  const readStreamBK = fs.createReadStream(
    process.env.NODE_ENV === 'development'
      ? path.join(path.resolve(), 'public', 'base.png')
      : path.join(path.resolve(), 'resources', 'app', 'public', 'base.png'),
  )
  const writeStreamBK = fs.createWriteStream(picPath.baseTempPic)

  const sharpDataResize = sharp()
    .resize({
      width: comList.baseTempPicCom.moviW,
      height: comList.baseTempPicCom.moviH,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()

  await pipeline(readStreamBK, sharpDataResize, writeStreamBK)

  console.log('動画の画面サイズの透明な画像を生成するok')

  // 画面サイズの透明画像と立ち絵の画像を合成する
  // UUIDが DEFAULT_KYARA_TATIE_UUID なら存在しないので、画面サイズの透明画像のパスを返す
  if (picFileName !== DEFAULT_KYARA_TATIE_UUID) {
    // 縮小した立ち絵の幅と高さを取得
    let tatieMetadata: SharpMetadata = await sharp(tempTatiePic)
      .metadata()
      .then((metadata: SharpMetadata) => {
        return metadata
      })
    console.log('縮小した立ち絵の幅と高さを取得')

    const top =
      comList.cnvBackPicmakeCom.top -
      (comList.cnvBackPicmakeCom.psition.height !== 0
        ? Math.floor(tatieMetadata.height / comList.cnvBackPicmakeCom.psition.height)
        : 0)
    const left =
      comList.cnvBackPicmakeCom.left -
      (comList.cnvBackPicmakeCom.psition.width !== 0
        ? Math.floor(tatieMetadata.width / comList.cnvBackPicmakeCom.psition.width)
        : 0)
    console.log(`top: ${top}`)
    console.log(`left: ${left}`)

    console.log(`left: ${left < 0 ? -left : 0}`)
    console.log(`top: ${top < 0 ? -top : 0}`)
    console.log(
      `width: ${
        tatieMetadata.width + (left < 0 ? left : 0) > comList.baseTempPicCom.moviW
          ? comList.baseTempPicCom.moviW
          : tatieMetadata.width + (left < 0 ? left : 0)
      }`,
    )
    console.log(
      `height: ${
        tatieMetadata.height + (top < 0 ? top : 0) > comList.baseTempPicCom.moviH
          ? comList.baseTempPicCom.moviH
          : tatieMetadata.height + (top < 0 ? top : 0)
      }`,
    )

    // 立ち絵の縦横が動画の画面サイズより大きいと合成できない(sharpの仕様)ため、
    // 配置位置に合わせて立ち絵をトリミングする。
    const FitTatie = async (tatie: string): Promise<void> => {
      const readStream = fs.createReadStream(tatie)
      const writeStream = fs.createWriteStream(picPath.tempTatieTriPic)
      const sharpData = sharp()
        .extract({
          left: left < 0 ? -left : 0,
          top: top < 0 ? -top : 0,
          width:
            tatieMetadata.width + (left < 0 ? left : 0) > comList.baseTempPicCom.moviW
              ? comList.baseTempPicCom.moviW
              : tatieMetadata.width + (left < 0 ? left : 0),
          height:
            tatieMetadata.height + (top < 0 ? top : 0) > comList.baseTempPicCom.moviH
              ? comList.baseTempPicCom.moviH
              : tatieMetadata.height + (top < 0 ? top : 0),
        })
        .png()

      await pipeline(readStream, sharpData, writeStream)
    }
    await FitTatie(tempTatiePic)

    console.log('縦横を再取得')

    tatieMetadata = await sharp(tempTatiePic)
      .metadata()
      .then((metadata: SharpMetadata) => {
        return metadata
      })

    console.log('処理開始')

    // 透明な背景との合成を実行
    // 立ち絵のtopとleftの座標はi左上が基準となるため、
    // 基本位置に合わせて座標の数値を引いて、立ち絵中央を基準にしている。
    const readStream = fs.createReadStream(picPath.baseTempPic)
    const writeStream = fs.createWriteStream(picPath.cnvBackPic + '.png', 'binary')
    await pipeline(
      readStream,
      sharp().composite([
        {
          input: picPath.tempTatieTriPic,
          top:
            top > 0
              ? comList.cnvBackPicmakeCom.top -
                (comList.cnvBackPicmakeCom.psition.height !== 0
                  ? Math.floor(tatieMetadata.height / comList.cnvBackPicmakeCom.psition.height)
                  : 0)
              : 0,
          left:
            left > 0
              ? comList.cnvBackPicmakeCom.left -
                (comList.cnvBackPicmakeCom.psition.width !== 0
                  ? Math.floor(tatieMetadata.width / comList.cnvBackPicmakeCom.psition.width)
                  : 0)
              : 0,
        },
      ]),
      writeStream,
    ).then(() => {
      console.log('writeStream処理完了')
      writeStream.end()
    })

    writeStream.on('end', () => {
      console.log('閉じました')
    })
    // 合成した画像のパスを返す。
    return picPath.cnvBackPic + '.png'
  } else {
    // 立ち絵がない場合は透明な画像をtempディレクトリに出力して、そのパスを返す。
    await sharp({
      create: {
        width: comList.baseTempPicCom.moviW,
        height: comList.baseTempPicCom.moviH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toFile(picPath.baseTempPic)
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
): Promise<string> => {
  // 立ち絵画像の縮小
  const tempTatiePic = await resizeTatiePath(
    picFileName,
    path.join(kyaraTatieDirPath, picFileName + '.png'),
    path.join(kyaraTatieDirPath, picFileName + '_' + sizeHeight.toString() + '.png'),
    {
      tatieW: null,
      tatieH: sizeHeight,
    },
  )
  if (tempTatiePic === null) {
    return null
  }

  return tempTatiePic
}
