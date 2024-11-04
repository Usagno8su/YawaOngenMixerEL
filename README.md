# やわ音原ミキサー
字幕と立ち絵付きソフトウェアトーク動画を、簡単に作成できるように補助するツール。

[公式サイト](https://yawaongen-mixer.org/)

# ！！！！注意！！！！

本ツールはまだアルファ版です。

重大な問題が発生する可能性がるため、メイン環境等では利用しないでください。

必ず仮想環境等の不具合が発生しても問題ない環境で使用してください。

# 解説動画

[【やわ音原ミキサー】動画作成支援ツールの開発報告01](https://www.nicovideo.jp/watch/sm41720805) 


# 概要

本ツールは、予め用意した音声合成ソフトの音声、その字幕および立ち絵を合成し、WebM形式の動画を作成します。

字幕と立ち絵以外は透明になっており、作成済みの動画と合成して簡単にソフトウェアトーク付き動画を作成可能です。

主にニコニコ動画への動画投稿に利用することを想定しています。

この手法の利点は、WebM形式に対応していれば Ubuntu 等のLinux環境でも、任意の動画作成ソフトを使用してソフトウェアトーク付き動画を作成できる点です。

ただ、実質エンコードの回数が１回増えることと、字幕の内容等を変更したくなった場合、再度エンコードが必要になるという欠点があります。


# 動画制作者の方へ

このツールのライセンスはMITライセンスです。
このため、動画制作に使用する際の制約はございません。

親作品に何かを登録するといったことも必須ではありませんが、
このGitHubのページをどこかに記載していただくか、
[ライセンス登録用のニコニ・コモンズ](https://commons.nicovideo.jp/works/nc362881)を親作品に入れて頂ければ幸いです。

ただし、免責事項については皆様にも関係があります。
フリーソフトではよくある事項ですが、この点はご了承いただき、メイン環境でのご利用については注意してください。

また、本ツール以外の素材等については、それぞれの規約に従って対応をお願い致します。

## フォントについて（Ubuntuの場合）

デフォルトの設定及び手順では「 Noto Sans CJK JP 」フォントを使用するようになっています。

このフォントは「 SIL Open Font License, Version 1.1. 」ライセンスのため、利用する際にはエンドクレジット等に著作権表示が必要です。

表示に決まったフォーマットは無いようなので、
状況に応じて必要な内容を記載をして頂ければ良いかと思います。

下記は表記例です。
（フォントファイルの情報から必要項目を抜粋しました）
```
本動画では下記のフォントを使用しています。
・ Noto Sans CJK JP 
　This Font Software is licensed under the SIL Open Font License, Version 1.1.
　© 2014-2019 Adobe (http://www.adobe.com/).
```

## フォントについて（Windowsの場合）

デフォルトの設定及び手順では「 モリサワ BIZ UDゴシック 」フォントを使用するようになっています。

このフォントのライセンスについては明確な情報を見つけきれていないのですが、非営利の利用なら問題ないようです。

モリサワフォントは「 SIL Open Font License, Version 1.1. 」ライセンスでの提供がされていますが、Windows付属のものは違うライセンスとなっている可能性があります。

問題がありそうな場合は[別途他のフォント](https://fonts.google.com/noto/specimen/Noto+Sans+JP)を使用してください。

使用時には、フォントファイルへのパスに日本語が入らないようにしてください。（途中のフォルダに日本語が入っていても正常動作しません）


# 動作環境

Ubuntu 22.04 LTS とWindows 10 64bit にて動作を確認しています。

Mac については申し訳ございませんが、今のところ対応予定はございません。

対応する音声合成ソフトは下記となります。

- VOICEVOX
- SHAREVOX
- VOICEPEAK
- COEIROINK
- A.I.VOICE
- CeVIO AI

VOICEPEAKについては、テキストファイル出力の有効化と、
出力ファイル名をVOICEVOXと同じに設定する必要があります。

それ以外のソフトについても[動画](https://www.nicovideo.jp/watch/sm43776899)にて設定方法を解説しております。
概ねVOICEVOXと同じ様式でファイルを出力して頂ければ問題ございません。

動画編集ソフトは「 [Shotcut](https://www.shotcut.org/) 」を使用しています。


# インストール方法

詳細については[公式サイト](https://yawaongen-mixer.org/)に記載しております。

## Ubuntuの場合

debファイルのインストール前に、依存するソフトのインストールが必要です。

```bash
sudo apt install ffmpeg imagemagick
```

## Windowsの場合

[FFmpeg](https://ffmpeg.org/)と[ImageMagick](https://imagemagick.org/)のインストールを行う必要があります。

# 開発環境の構築方法

Ubuntuで開発を行うことを前提に記載します。

事前に`ffmpeg`と`imagemagick`のインストールを行ってください。

コードを`clone`した後に、ディレクトリ内で下記を実行してビルドと実行を行います。

```bash
npm install
npm run start
```

また、配布用パッケージをビルドしたい場合は、各環境に合わせて下記を実行します。

- Ubuntu (deb形式)

```bash
npm run make
```

- Windows（zipファイル）

```bash
npm run makewin
```


# ライセンス

このツールは MIT ライセンスです。
