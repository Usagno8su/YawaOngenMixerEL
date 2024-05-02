<script setup lang="ts">
import makeComList from '@/components/makeComList.vue'
import { ref } from 'vue'
import { dataTextType } from '@/type/data-type'
import { typeColor } from '@/data/data'
import GlobalSettingInfo from '@/components/unit/GlobalSettingInfo.vue'

const { yomAPI } = window

const refMakeComList = ref(null)

const openGlobalSettingView = ref<boolean>(false)

// 設定を未保存かどうか
const seveStatus = ref<boolean>(false)

// ボタンクリックで設定タイプを切り替え
const settype = ref<dataTextType>('defo')
const setClick = (set: dataTextType) => {
  settype.value = set
  console.log('settype.value: ' + settype.value)
}

const setGlobalSetting = (): void => {
  openGlobalSettingView.value = !openGlobalSettingView.value
}

// ショートカットキーで設定保存のコマンドがあった場合は保存を行う
yomAPI.openGlobalSetting(() => {
  setGlobalSetting()
})

// 色設定から必要なTailwind CSS を取り出して整形する
const setTypeColor = (stype: dataTextType): string => {
  return typeColor[stype].bg + ' hover:' + typeColor[stype].hoverBG + ' hover:' + typeColor[stype].hoverText
}

// 選択中のボタンの場合は高さとフォントの太さを変更する
const actset = (stype: dataTextType): string => {
  return (
    'mr-1 p-1 border rounded-sm' +
    ' ' +
    setTypeColor(stype) +
    ' ' +
    (settype.value === stype ? 'font-medium h-9 border-black' : 'font-normal h-8 border-gray-600')
  )
}

// 設定に編集があったときにはtrueを入れる
const setChangeDataSettingSta = (sta: boolean): void => {
  seveStatus.value = sta
}

// 設定編集をしたかによってボタンの色を変更する
const classSaveButton = (): string => {
  return (
    'rounded-lg border border-black px-2 py-1' +
    ' ' +
    (seveStatus.value === true ? 'bg-red-500 hover:bg-yellow-500 hover:text-gray-900' : 'text-gray-500 bg-gray-200')
  )
}

// 現在表示中のプロファイル保存を実行
const seveProfile = (): void => {
  refMakeComList.value.writeSettingData()
}
</script>

<template>
  <GlobalSettingInfo v-if="openGlobalSettingView" :clickClose="() => setGlobalSetting()" />
  <div class="h-[780px]" v-else>
    <div class="flex justify-between">
      <div class="flex items-end">
        <button :class="actset('defo')" @click="setClick('defo')">デフォルト設定</button>
        <button :class="actset('kyara')" @click="setClick('kyara')">各キャラ設定</button>
        <button :class="actset('kyast')" @click="setClick('kyast')">スタイル付キャラ設定</button>
        <button :class="actset('seid')" @click="setClick('seid')">音声ファイル個別の設定</button>
      </div>
      <div>
        <!-- 設定保存状態によって文言とクリック可能状態にするかも指定する -->
        <button :class="classSaveButton()" @click="seveProfile" :disabled="!seveStatus">
          {{ seveStatus === true ? '設定保存' : '保存済み' }}
        </button>
      </div>
    </div>
    <div class="h-full border border-gray-800 px-1 pt-5">
      <makeComList
        :settype="settype"
        :setTypeChange="setClick"
        :setChangeDataSettingSta="setChangeDataSettingSta"
        ref="refMakeComList"
      />
    </div>
  </div>
</template>
