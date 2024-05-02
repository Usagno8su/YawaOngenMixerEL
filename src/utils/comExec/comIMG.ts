// このファイルはメイン側で利用するため、レンダラー側では読み込めない
// ImageMagic関連のコマンドを記載
import { outSettingType } from '../../type/data-type'
// import { ref } from 'vue'

// 設定情報を元にImageMagicに送付するコマンドを作成
// これをメイン側に送って画像作成を行う
export type createComImgType = {
  tatieResizeCom: string[] // 元の立ち絵を設定に応じて縮小するコマンド
  baseTempPicCom: string[] // 動画の画面サイズの透明な画像を生成するコマンド
  cnvBackPicmakeCom: string[] // 画面サイズの透明画像と立ち絵の画像を合成するコマンド
}
export const createComImg = async (fileSetting: outSettingType): Promise<createComImgType> => {
  //// 画面サイズの透明画像と立ち絵の画像を合成するコマンドを作成
  // convert 透明な画面サイズの出力ファイル（一時的）.png 立ち絵出力ファイル（一時的）.png -gravity ${立ち絵の配置位置（起点の位置）} \
  //                      -background none -geometry ${立ち絵の起点位置からどれだけ移動させるか} -compose over -composite ${完成画像の出力位置.png}
  //

  // 幅の部分がプラスかマイナスかを指定する。
  // ただし、起点がEast（右）の場合はImageMagickの仕様上、方向が逆転するためプラスマイナスを逆にする。
  const selectTatieSignW = async (): Promise<string> => {
    if (Math.sign(fileSetting.tatie.tatiePwPs.val) === -1) {
      if (fileSetting.tatie.tatieSide.val.indexOf('East') !== -1) {
        return '+'
      } else {
        return '-'
      }
    } else {
      if (fileSetting.tatie.tatieSide.val.indexOf('East') !== -1) {
        return '-'
      } else {
        return '+'
      }
    }
  }
  const tatieSignW = await selectTatieSignW()

  // 高さの部分がプラスかマイナスかを指定する。
  // ただし、起点がSouth（下）の場合はImageMagickの仕様上、方向が逆転するためプラスマイナスを逆にする。
  const selectTatieSignH = async (): Promise<string> => {
    if (Math.sign(fileSetting.tatie.tatiePhPs.val) === -1) {
      if (fileSetting.tatie.tatieSide.val.indexOf('South') !== -1) {
        return '-'
      } else {
        return '+'
      }
    } else {
      if (fileSetting.tatie.tatieSide.val.indexOf('South') !== -1) {
        return '+'
      } else {
        return '-'
      }
    }
  }
  const tatieSignH = await selectTatieSignH()

  // 結果を出力する
  return {
    //// 元の立ち絵を設定に応じて縮小するコマンドを作成
    // convert -resize x${立ち絵の高さ} 元の立ち絵のファイル名.png 立ち絵出力ファイル（一時的）.png`
    //
    // 立ち絵を画面の高さの何％にするか「 fileSetting.tatie.tatieHpx.val 」に指定されているので、それに合わせて高さを算出する。
    // 小数点以下は切り捨てる。
    tatieResizeCom: ['-resize', `x${Math.floor((fileSetting.tatie.moviH.val / 100) * fileSetting.tatie.tatieHpx.val)}`],
    //// 動画の画面サイズの透明な画像を生成するコマンドを作成
    // convert -size ${画像の幅}x${画像の高さ} xc:none 透明な画面サイズの出力ファイル（一時的）.png
    //
    baseTempPicCom: ['-size', `${fileSetting.tatie.moviW.val}x${fileSetting.tatie.moviH.val}`, 'xc:none'],
    cnvBackPicmakeCom: [
      '-gravity',
      fileSetting.tatie.tatieSide.val.toString(),
      '-background',
      'none',
      '-geometry',
      // 立ち絵の位置を指定した幅と高さ分移動(tatiePwPsとtatiePhPs)させるため、％をピクセルに変換する。
      // 小数点以下は切り捨てる。また絶対値にする（マイナスは一旦外す）。
      `${tatieSignW}${Math.floor((fileSetting.tatie.moviW.val / 100) * Math.abs(fileSetting.tatie.tatiePwPs.val))}` +
        `${tatieSignH}${Math.floor((fileSetting.tatie.moviH.val / 100) * Math.abs(fileSetting.tatie.tatiePhPs.val))}`,
      '-compose',
      'over',
      '-composite',
    ],
  }
}
