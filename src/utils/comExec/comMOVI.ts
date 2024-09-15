// このファイルはメイン側で利用するため、レンダラー側では読み込めない
// FFmpeg関連のコマンドを記載
import { outSettingType, subAlignmentSideType } from '../../type/data-type'
import { arrayHalfValue } from '../analysisGeneral'
import { LoadFFmpegVersion } from './comEnter'
import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { ref } from 'vue'

// 字幕の文字列を分割する際に、どの文字で分割するか指定する。
// ここで指定した文字で字幕を分けて複数行にする。
// 優先度順に記載する。
const subSplitList = ['。', '、', '！', '？']

// 設定情報を元にFFmpegに送付するコマンドを作成
// なお、字幕の表示はテキストファイルの解析が必要のため、この関数はメイン側で動作させる。
// エンコードを実施するコマンドを作成
// このとき「-shortest」を入れないとエンコードが止まらない。
// また「-fflags shortest -max_interleave_delta 100M」を入れないと動画の後ろに余計な無音時間が入る。
// ffmpeg -y -loop 1 -r ${動画FPS} -i ${立ち絵の入った画像ファイル} -i ${音声ファイル} \
//          -auto-alt-ref 0 -c:a libvorbis -c:v libvpx-vp9 -shortest -fflags shortest -max_interleave_delta 20M \
//          ${字幕設定のコマンド} -r ${動画FPS} ${出力ファイル名}
export const createComMovi = async (
  fileSetting: outSettingType,
  tatieFile: string,
  voiceFileDirPath: string,
  textDirPathName: string,
  ffmpegPath: string,
): Promise<string[]> => {
  // バージョン番号を取得
  const ffmpegVersion = await LoadFFmpegVersion(ffmpegPath)

  const ans: Promise<string[]> = new Promise((resolve) => {
    // 字幕の設定を作成
    return resolve(createSubtitleCom(fileSetting, voiceFileDirPath, textDirPathName))
  }).then((value: string[]) => {
    const subtitle =
      value !== null ? ['-filter_complex'].concat(process.platform === 'win32' ? `"${value}"` : value) : []

    // エンコードを実施するコマンドを作成
    // このとき「-shortest」を入れないとエンコードが止まらない。
    // また「-fflags shortest -max_interleave_delta 100M」を入れないと動画の後ろに余計な無音時間が入る。
    return [
      '-y',
      '-loop',
      '1',
      '-r',
      fileSetting.tatie.fps.val.toString(),
      '-i',
      process.platform === 'win32' ? `"${tatieFile}"` : tatieFile,
      '-i',
      process.platform === 'win32'
        ? `"${path.join(voiceFileDirPath, fileSetting.fileName + '.' + fileSetting.fileExtension)}"`
        : path.join(voiceFileDirPath, fileSetting.fileName + '.' + fileSetting.fileExtension),
    ]
      .concat('-auto-alt-ref 0 -c:a libvorbis -c:v libvpx-vp9'.split(' '))
      .concat(
        // バージョン番号により、コマンドを変更する。
        ffmpegVersion[0] === '4' ? '-shortest -fflags shortest -max_interleave_delta 20M'.split(' ') : '-shortest',
      )
      .concat(subtitle)
      .concat(['-r', fileSetting.tatie.fps.val.toString()])
  })

  return ans
}

// 字幕の解析とそれを表示するためのコマンドを作成する
// voiceFileDirPath: 音声と字幕のファイルがあるディレクトリ
// textDirPathName: 分割した字幕テキストファイルを出力するディレクトリ
export const createSubtitleCom = async (
  fileSetting: outSettingType,
  voiceFileDirPath: string,
  textDirPathName: string,
): Promise<string[]> => {
  // 字幕テキストファイルの存在チェック
  const noSubtitleFile = !fs.existsSync(path.join(voiceFileDirPath, fileSetting.fileName + '.txt'))

  //// 字幕を入れるか判断する。
  // 字幕がONになっており、字幕のテキストファイルが存在すれば実行する。
  if (fileSetting.subtitle.subText.active && noSubtitleFile === false) {
    // 字幕のフチに色をつけるか判断する
    const subTextBord = fileSetting.subtitle.subTextBord.val
      ? `bordercolor=${fileSetting.subtitle.subOrdercr.val}:borderw=${fileSetting.subtitle.subBorderW.val}:`
      : ''

    // 字幕テキストの分割を実施
    const textList = await subTextSplit(fileSetting, 'utf8', voiceFileDirPath, textDirPathName)

    // 字幕をどちらに寄せるかによって字幕の描写開始位置を変える
    let subSide = ''
    if (fileSetting.subtitle.subAlignment.val === 'Left') {
      // 左
      subSide = '(w*0.3)-(w*0.04)'
    } else if (fileSetting.subtitle.subAlignment.val === 'Right') {
      // 右
      subSide = '(w*0.06)'
    } else {
      // 中央
      subSide = '((w-tw)/2)'
    }

    // 字幕の背景色を入れる
    const subBg = subBgCom(
      fileSetting.subtitle.subBG.val,
      fileSetting.subtitle.subAlignment.val,
      fileSetting.subtitle.subBgcolor.val,
      fileSetting.subtitle.subBgTr.val,
    )

    const textComLine = await makeTextList(fileSetting, textList, subTextBord, subSide)

    return [`format=rgba${subBg}${textComLine}`]
  } else {
    return null
  }
}

// 行ごとに分割された字幕テキストファイルのリストから、字幕用のコマンドを作成する
export const makeTextList = async (
  fileSetting: outSettingType,
  textList: string[],
  subTextBord: string,
  subSide: string,
): Promise<string> => {
  //// 文字描写の開始位置のy座標を決める。
  //// 二行以上の場合は、その分描写開始位置を上にずらす必要がある。
  //// 行数をカウントしてその文を収めるだけの高さから開始する。
  //// 万が一、行数が多くて開始位置がマイナスになると、おそらくエラーになるので「0」にする。
  //// また、文字の高さ分だけ開始位置を上にすると、動画の下ギリギリに字幕が描写されるので + fileSetting.subtitle.subTextSpaceSize.val している。

  // 字幕の行数が多くて開始位置がマイナスになるか確認し、
  // マイナスになる場合はgyoucuntに画面いっぱいに表示できる最大の行数を記録する。
  let textLineLength =
    fileSetting.tatie.moviH.val -
      (fileSetting.subtitle.subSize.val - textList.length + fileSetting.subtitle.subTextSpaceSize.val) <=
    0
      ? fileSetting.tatie.moviH.val / fileSetting.subtitle.subSize.val
      : textList.length

  console.log('textList: ' + textList)
  let ans = ''

  for await (const line of textList) {
    ans +=
      `,drawtext=fontfile='${fileSetting.subtitle.fontsPath.val.replace(/\\/g, '\\\\').replace(/:\\/g, '\\:\\')}':` +
      `textfile='${line}':fontcolor=${fileSetting.subtitle.subColor.val}:` +
      `${subTextBord}fontsize=${fileSetting.subtitle.subSize.val}:` +
      `x=${subSide}:y=h-(((${fileSetting.subtitle.subSize.val})*${textLineLength})+${fileSetting.subtitle.subTextSpaceSize.val})`

    // 文字列をひとつ出力したので、次の文字がその下に表示されるように textLineLength の値をひとつ少なくします。
    textLineLength--
  }

  console.log('ans ========================:' + ans)

  return ans
}

// 字幕の背景色を入れるか判断する。
export const subBgCom = (
  subBG: boolean,
  subAlignment: subAlignmentSideType,
  subBgcolor: string,
  subBgTr: number,
): string => {
  // 字幕を入れない場合は空を返す
  if (subBG) {
    let side = ''

    // 字幕の左右によって背景色の描写開始位置を変える
    if (subAlignment === 'Left') {
      // 左
      side = '(iw*0.25)'
    } else if (subAlignment === 'Right') {
      // 右
      side = '(iw*0.05)'
    } else {
      // 中央
      side = '(iw*0.15)'
    }

    return `drawbox=x=${side}:y=ih*0.8:w=iw*0.7:h=ih*0.2:t=fill:color=${subBgcolor}@${subBgTr.toString()}:replace=1`
  } else {
    return ''
  }
}

// 字幕のテキストファイルの中身を解析し、
// 一行ごとに分割したテキストファイルのパスを入れた配列を返す。
// dirPathName: 音声と字幕のファイルがあるディレクトリ
// textDirPathName: 分割した字幕テキストファイルを出力するディレクトリ
export const subTextSplit = async (
  fileSetting: outSettingType,
  fileEncode: BufferEncoding,
  dirPathName: string,
  textDirPathName: string,
): Promise<string[]> => {
  // 分割した字幕テキストを出力したファイルのリスト
  const tempFileList = ref<string[]>([])

  // 分割する場所を指定する。
  // 自動改行を行うか判定
  // 自動改行を行わない場合、全ての文字列を一時ファイルに出力する。
  const selectSplitPoint = async (text: string): Promise<number> => {
    if (fileSetting.subtitle.subAutoRt.val) {
      // 分割が必要（文字列が画面外にはみ出てしまう）かどうか確認し、必要であれば分割処理を行う。
      // 余白を確保するため、横幅からは左右５％（全部で１０％）引く
      if (
        fileSetting.subtitle.subSize.val * text.length >
        fileSetting.tatie.moviW.val - fileSetting.tatie.moviW.val / 10
      ) {
        // 分割を試みる
        const sliceLenCount = await textSplitSearch(text, subSplitList)
        console.log('分割を試みる' + sliceLenCount)
        // 分割する位置が -1 の場合は指定した文字が見つからなかったので、中央で分割する。(小数点以下は切り捨てる。)
        //  -1 ではない場合はそのまま値を入れる。
        if (sliceLenCount === -1) {
          return Math.floor(text.length / 2)
        } else {
          return sliceLenCount + 1 // 対象文字の次を指定する。
        }
      } else {
        return text.length
      }
    } else {
      return text.length
    }
  }

  const loadFileLineArray = async (
    fileSetting: outSettingType,
    fileEncode: BufferEncoding,
    dirPathName: string,
  ): Promise<string[]> => {
    const linesa: string[] = new Array(0)
    // 字幕テキストの内容を、行ごとに配列に格納する
    const fileStream = fs.createReadStream(path.join(dirPathName, fileSetting.fileName) + '.txt', fileEncode)
    const fileReader = readline.createInterface({ input: fileStream })
    for await (const line of fileReader) {
      linesa.push(line)
      console.log('lines内部: ' + line)
    }
    return linesa
  }

  // 字幕テキストの内容を、行ごとに配列に格納する
  const lines = await loadFileLineArray(fileSetting, fileEncode, dirPathName)

  // 出力するテキストファイルのカウント用変数(
  let ansTextCount = -1

  // 行ごとに処理する
  for await (const line of lines) {
    // 文字列を一旦別の変数に格納する。
    console.log('line: ' + line)
    let tempLine = line

    // 文字列が空であれば（全ての文字列の処理が終わったら）終了する。
    while (tempLine.length > 0) {
      // 取り出す文字数をカウント
      const readCount = await selectSplitPoint(tempLine)

      // ファイルに書き込んでカウントする。
      // その時ゼロ埋めで5桁にする
      // 抽出した文字列は変数から削除する
      console.log('tempLine: ' + tempLine)
      // 行数のカウントをひとつ増やす。
      ansTextCount++
      const fileName = `YOM_temptext${ansTextCount.toString().padStart(5, '0')}`
      const outText = tempLine.substring(0, readCount)
      try {
        // 書き込み
        console.log('outText: ' + outText)
        fs.writeFileSync(path.join(textDirPathName, fileName + '.txt'), outText)
      } catch (err) {
        console.log('error: ' + err)
      }
      tempLine = tempLine.replace(outText, '')

      // テキストを出力した一時ファイル名を記録する。
      tempFileList.value.push(
        process.platform === 'win32'
          ? path
              .join(textDirPathName, fileName + '.txt')
              .replace(/\\/g, '\\\\')
              .replace(/:\\/g, '\\:\\')
          : path.join(textDirPathName, fileName + '.txt'),
      )
    }
  }

  console.log('tempFileList.value: ' + tempFileList.value)
  return tempFileList.value
}

// 与えられた文字列を指定した文字で２つに分割できるところを検索する。
// 「、」や「。」で分割する。(splist配列に1文字づつ入れる)
// 分割する文字がない場合は -1 を返す。
//
//  分割する場所を数値で返す。
export const textSplitSearch = async (tempLine: string, splitList: string[]): Promise<number> => {
  for await (const splitString of splitList) {
    // 分割したい文字がある場所を入れる配列を宣言
    const foundIti: number[] = []

    const foundSplitPointList = async (): Promise<void> => {
      // 該当の文字があるか検索
      let x = tempLine.indexOf(splitString)

      // -1 ではなければ分割したい文字がある場所の数値が入っているので、
      // 数値を配列に入れてその次の文字からまた検索する。
      while (x !== -1) {
        foundIti.push(x)
        x = tempLine.indexOf(splitString, x + 1)
      }
    }

    const ans = await foundSplitPointList().then(() => {
      // 検索した文字が見つからない（foundItiが空）か、
      // 文字列の一番最後にしかない場合（検索文字がひとつしかなく、なおかつその文字が最後あたりにある）は次へ行く。
      const nonReturnCount = 3 // 前後の改行しない範囲
      if (
        foundIti.length !== 0 &&
        !(foundIti.length === 1 && tempLine.indexOf(splitString, tempLine.length - nonReturnCount) !== -1)
      ) {
        // 見つかった中で、中央に近い方の値を返す。
        return arrayHalfValue(foundIti)
      } else {
        return -1
      }
    })
    if (ans !== -1) {
      return ans
    }
  }

  // 分割する文字がない場合は -1 を返す。
  return -1
}
