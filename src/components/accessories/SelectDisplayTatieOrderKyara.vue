<script setup lang="ts">
const props = defineProps<{
  clickClose: () => void
  TatieOrderChange: (uuid: string, outSetting: outSettingType) => void
  settype: dataTextType
  dateList: outSettingType[]
  selectTatieOrderListUUID: string
  selectDataType: dataTextType
  selectKyaraName: string
  subTextStringList: { [key: string]: { val: string; active: boolean } }
  useSubText: boolean
  selectKyaraStyle?: string
}>()
// 複数の立ち絵の表示順番を設定する画面で、キャラ設定の選択を行う画面

import { ref } from 'vue'
import type { outSettingType, dataTextType } from 'src/type/data-type'
import { typeColor } from '@/data/data'
import { MakeClassString } from '@/utils/analysisGeneral'
import { FindAllString } from '@/utils/analysisData'
import SearchInputUnit from '@/components/unit/SearchInputUnit.vue'

// 検索用
const refSearchString = ref<{ searchString: string }>({ searchString: undefined })

// キャラ設定からseid以外を抽出する。
// defo, kyara, kyast の順で記録する。
const kyaraProfileList = props.dateList
  .filter((e) => e.dataType === 'defo' || e.dataType === 'kyara')
  .concat(props.dateList.filter((e) => e.dataType === 'kyast'))
  .concat(props.settype === 'seid' ? props.dateList.filter((e) => e.dataType === 'seid') : [])

// キャラの変更と選択画面のcloseを行う
const KyaraChange = (outSetting: outSettingType): void => {
  props.TatieOrderChange(props.selectTatieOrderListUUID, outSetting)
  props.clickClose()
}
</script>

<template>
  <div class="fixed top-0 right-0 flex h-screen w-screen items-center justify-center" @click.self="clickClose()">
    <!-- 画面外クリックでクローズ -->
  </div>
  <div class="fixed top-1/3 flex w-96 flex-col rounded-xl border-1 border-gray-800 bg-blue-100 px-5 py-4 text-sm">
    <div class="h-80 overflow-y-scroll border border-gray-600">
      <SearchInputUnit classSetting="bg-gray-300" inputTitle="立ち絵名かキャラ名で検索" ref="refSearchString" />
      <div class="">
        <div v-for="item in kyaraProfileList" v-bind:key="item.uuid">
          <button
            :class="
              MakeClassString(
                'my-1 ml-1 flex w-11/12 items-center rounded-3xl border border-black px-2 text-lg',
                typeColor[item.dataType].bg,
              )
            "
            :title="
              item.name +
              (item.dataType === 'kyast'
                ? '（' + item.kyaraStyle + '）'
                : item.dataType === 'seid'
                  ? '：' +
                    (subTextStringList[item.uuid].active
                      ? subTextStringList[item.uuid].val
                      : item.fileName + '.' + item.fileExtension)
                  : '')
            "
            v-if="FindAllString(refSearchString.searchString, [item.kyaraStyle, item.name])"
            @click="() => KyaraChange(item)"
          >
            <div class="max-w-60 truncate">{{ item.name }}</div>
            <div class="max-w-48 truncate" v-if="item.dataType === 'kyast'">
              {{ '（' + item.kyaraStyle + '）' }}
            </div>
            <div class="max-w-48 truncate" v-else-if="item.dataType === 'seid' && subTextStringList[item.uuid].active">
              {{
                '：' +
                (subTextStringList[item.uuid].active
                  ? subTextStringList[item.uuid].val
                  : item.fileName + '.' + item.fileExtension)
              }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
