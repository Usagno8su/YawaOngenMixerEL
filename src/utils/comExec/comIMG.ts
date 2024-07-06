// このファイルはメイン側で利用するため、レンダラー側では読み込めない
// 画像の加工を行うsharp関連の値を作成する。
import { outSettingType } from '../../type/data-type'

// 設定情報を元にsharpで使用する値を作成
// これをメイン側に送って画像作成を行う
export type createComImgType = {
  tatieResizeCom: {
    // 元の立ち絵を設定に応じて縮小する
    tatieW: number
    tatieH: number
  }
  baseTempPicCom: {
    // 動画の画面サイズの透明な画像を生成する
    moviW: number
    moviH: number
  }
  cnvBackPicmakeCom: {
    // 画面サイズの透明画像と立ち絵の画像を合成する
    gravity: string
    top: number
    left: number
    psition: {
      width: number
      height: number
    }
  }
}
export const createComImg = async (fileSetting: outSettingType): Promise<createComImgType> => {
  //// 画面サイズの透明画像と立ち絵の画像を合成するコマンドを作成
  // 立ち絵の基本位置の設定に応じて、高さと幅を変更する

  // 幅の部分の基本位置を決める
  // 右や中央にいる場合は横移動させる。(中央の場合は横幅の半分)
  // 合成時に立ち絵の幅によって左に移動させる。
  const selectTatiepPsitionW = async (): Promise<number[]> => {
    if (fileSetting.tatie.tatieSide.val.indexOf('East') !== -1) {
      return [fileSetting.tatie.moviW.val, 1]
    } else if (fileSetting.tatie.tatieSide.val.indexOf('West') === -1) {
      return [Math.floor(fileSetting.tatie.moviW.val / 2), 2]
    } else {
      return [0, 0]
    }
  }
  const tatiePsitionW = await selectTatiepPsitionW()

  // 高さの部分の基本位置を決める
  // 下や中央にいる場合は縦移動させる。(中央の場合は縦幅の半分)
  // 合成時に立ち絵の高さによって上に移動させる。
  const selectTatiePsitionH = async (): Promise<number[]> => {
    if (fileSetting.tatie.tatieSide.val.indexOf('South') !== -1) {
      return [fileSetting.tatie.moviH.val, 1]
    } else if (fileSetting.tatie.tatieSide.val.indexOf('Nort') === -1) {
      return [Math.floor(fileSetting.tatie.moviH.val / 2), 2]
    } else {
      return [0, 0]
    }
  }
  const tatiePsitionH = await selectTatiePsitionH()

  // 結果を出力する
  return {
    //// 元の立ち絵を、設定に応じてどの高さまで縮小するか決める。
    // 立ち絵を画面の高さの何％にするか「 fileSetting.tatie.tatieHpx.val 」に指定されているので、それに合わせて高さを算出する。
    // 小数点以下は切り捨てる。
    tatieResizeCom: {
      tatieW: null,
      tatieH: Math.floor((fileSetting.tatie.moviH.val / 100) * fileSetting.tatie.tatieHpx.val),
    },
    //// 動画の画面サイズの透明な画像を生成する
    baseTempPicCom: {
      moviW: fileSetting.tatie.moviW.val,
      moviH: fileSetting.tatie.moviH.val,
    },
    // 立ち絵を基本位置からどの程度左右に移動させるか決める。
    // 高さについては上が0で下に行くほどプラスされる仕様のため、反転させている。
    cnvBackPicmakeCom: {
      gravity: fileSetting.tatie.tatieSide.val.toString(),
      top: Math.floor((fileSetting.tatie.moviH.val / 100) * -fileSetting.tatie.tatiePhPs.val + tatiePsitionH[0]),
      left: Math.floor((fileSetting.tatie.moviW.val / 100) * fileSetting.tatie.tatiePwPs.val + tatiePsitionW[0]),
      // 基本位置によって
      psition: {
        width: tatiePsitionW[1],
        height: tatiePsitionH[1],
      },
    },
  }
}
