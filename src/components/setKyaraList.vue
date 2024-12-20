<script setup lang="ts">
const props = defineProps<{
  dateList: outSettingType[]
  settype: dataTextType
  selectKyara: number
  setDataTypeClick: (id: number, selectItem: outSettingType) => void
  addNewKyara: (dataType: dataTextType, kyaraName: string, kyaraStyle: string) => boolean
  askDeleteKyara: (index: number) => void
  encodeCliek: (index: number) => void
  disableEnterEncode: boolean
  onChangeKyaraProfile: (uuid: string) => void
  inputProfileUUID: string
  createProfileData: (copyUuid: boolean) => Promise<string>
  subTextStringList: { [key: string]: { val: string; active: boolean } }
  useSubText: boolean
  searchKyaraEvent: (text: string) => void
  CopyKyaraSetting: (dataType: dataTextType, uuid: string) => void
}>()
import { watch, ref, nextTick } from 'vue'
import { outSettingType, dataTextType, editKyaraNameType } from '@/type/data-type'
import { checkSameValues, FindAllString, createNewDateList } from '@/utils/analysisData'
import AccEditKyaraName from '@/components/accessories/AccEditKyaraName.vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import SelectProfileList from '@/components/unit/SelectProfileList.vue'
import SearchInputUnit from '@/components/unit/SearchInputUnit.vue'
import SelectDisplayKyaraRightClickMenu from '@/components/accessories/SelectDisplayKyaraRightClickMenu.vue'

const { yomAPI } = window

const isNewOpen = ref<boolean>(false)
const isEditOpen = ref<string | boolean>(null)
const isMenuOpen = ref<boolean>(false)
const editKyaraName = ref<outSettingType>(createNewDateList(undefined, undefined, '', '', {}, {}))
const editBeforeKyaraNameType = ref<editKyaraNameType>({
  name: undefined,
  kyaraStyle: undefined,
})

// SearchInputUnitに入力した検索文字列を取得するための変数
const refSearchString = ref<{ searchString: string }>({ searchString: undefined })

// selectProfileListの関数を利用するためのRef
const selectProfileListRef = ref(null)

// スクロールエリアの自動移動のための変数
const selectAreaRef = ref<HTMLDivElement>()

// selectProfileListRef を親コンポーネントから呼び出せるようにします
defineExpose({ selectProfileListRef })

// 選択中のボタンの場合は背景色を変更する
// dateList[props.selectKyara].uuidが一致すれば色を変える。
const actSet = (ltype: string): string => {
  return (
    'h-8 flex items-center justify-between mt-1 mx-1 p-1 border border-gray-600' +
    ' ' +
    (props.dateList[props.selectKyara]?.uuid === ltype
      ? 'bg-blue-400 hover:bg-blue-500 hover:text-gray-200'
      : 'bg-blue-200 hover:bg-blue-500 hover:text-gray-200')
  )
}

// リストの各項目にrefを設定する
const kyaraRefs = ref<HTMLDivElement[]>([])
const selectKyaraRef = (e: HTMLDivElement) => {
  // 存在するか＆重複があるか確認する
  if (e && !kyaraRefs.value.includes(e)) {
    kyaraRefs.value.push(e)
  }
}

// キャラの追加
const newKyaraData = (): void => {
  console.log('キャラの追加・変更処理')

  // キャラ名が入っているか確認
  if (editKyaraName.value.name === undefined || editKyaraName.value.name === null) {
    console.log('キャラ名未設定: ' + editKyaraName.value.name)
    cancelEditKyaraData()
    return
  }

  // スタイル名が入っているか確認
  if (
    props.settype === 'kyast' &&
    (editKyaraName.value.kyaraStyle === undefined || editKyaraName.value.kyaraStyle === null)
  ) {
    console.log('スタイル未設定: ' + editKyaraName.value.kyaraStyle)
    cancelEditKyaraData()
    return
  }

  // 重複要素があればキャンセルする。
  if (checkSameValues(props.dateList, editKyaraName.value)) {
    console.log('重複: ' + editKyaraName.value.name)
  } else {
    props.addNewKyara(props.settype, editKyaraName.value.name, editKyaraName.value.kyaraStyle) // 書き込み
  }

  cancelEditKyaraData()
}

// キャラの変更
const editKyaraData = (index: number): void => {
  // キャラ名が入っているか確認
  if (props.dateList[index].name === '') {
    console.log('キャラ名未設定: ' + props.dateList[index].name)

    // 元の値に戻す
    props.dateList[index].name = editBeforeKyaraNameType.value.name
  }

  // スタイル名が入っているか確認
  if (props.settype === 'kyast' && props.dateList[index].kyaraStyle === '') {
    console.log('スタイル未設定: ' + props.dateList[index].kyaraStyle)

    // 元の値に戻す
    props.dateList[index].kyaraStyle = editBeforeKyaraNameType.value.kyaraStyle
  }
  console.table(props.dateList[index])

  // 重複要素があればキャンセルする。
  if (checkSameValues(props.dateList, props.dateList[index], index)) {
    console.log('重複: ' + props.dateList[index].name)
    // 元の値に戻す
    props.dateList[index].name = editBeforeKyaraNameType.value.name
    props.dateList[index].kyaraStyle = editBeforeKyaraNameType.value.kyaraStyle
  }

  cancelEditKyaraData()
}

// キャラの追加・変更のキャンセル処理
// 変数を空にして入力欄を閉じる
const cancelEditKyaraData = (): void => {
  editKyaraName.value.name = undefined
  editKyaraName.value.kyaraStyle = undefined
  isNewOpen.value = false
  isEditOpen.value = false
}

// キャラ設定の新規追加ポタンが押された場合
// 追加用のinput項目を表示
const newDataClik = (): void => {
  console.log('キャラ追加: ')

  // 他の項目を編集中の場合は閉じる
  if (isEditOpen.value !== false) {
    cancelEditKyaraData()
  }
  isNewOpen.value = true
}

// キャラ設定の変更ポタンが押された場合
// 変更用のinput項目を表示
const editDataClik = (uuid: string, name: string | undefined, kyaraStyle: string | undefined): void => {
  if (props.settype === 'kyara' || props.settype === 'kyast') {
    // 新規追加中の場合は閉じる
    if (isNewOpen.value !== false) {
      cancelEditKyaraData()
    }
    isEditOpen.value = uuid
    // 変更前の状態を記録
    editBeforeKyaraNameType.value = {
      name: name,
      kyaraStyle: kyaraStyle,
    }
  }
}

// 入力欄でエンターが押されるか、確定ボタンが押されたとき
const onInData = (index?: number): void => {
  // 変更の場合
  if (index !== undefined) {
    editKyaraData(index)
  } else {
    newKyaraData()
  }
}

// ショートカットキーでキャラ設定コピーのコマンドがあった場合はコピーを行う。
yomAPI.CopyToKyara((dataType: string) => {
  isMenuOpen.value = false
  if (dataType === 'kyara') {
    props.CopyKyaraSetting('kyara', props.dateList[props.selectKyara].uuid)
  } else if (dataType === 'kyast') {
    props.CopyKyaraSetting('kyast', props.dateList[props.selectKyara].uuid)
  }
})

// ショートカットキーで名前の変更のコマンドがあった場合は編集画面を表示する
yomAPI.EntEditName(() => {
  isMenuOpen.value = false
  editDataClik(
    props.dateList[props.selectKyara].uuid,
    props.dateList[props.selectKyara].name,
    props.dateList[props.selectKyara].kyaraStyle,
  )
})

// ショートカットキーで削除のコマンドがあった場合は削除ダイアログを開く
yomAPI.EntAskDelete(() => {
  isMenuOpen.value = false
  props.askDeleteKyara(props.selectKyara)
})

// props.settype, props.selectKyaraが変更されたときの処理
watch(
  () => [props.settype, props.selectKyara],
  () => {
    // キャラの追加・変更処理をキャンセルする。
    cancelEditKyaraData()
  },
)

watch(
  () => [props.settype],
  () => {
    // 表示後に現在選択中のキャラ項目を表示するようにスクロールする
    nextTick(() => {
      const selectDiv = props.dateList.findIndex((e) => e.uuid === props.dateList[props.selectKyara].uuid)
      kyaraRefs.value[selectDiv].scrollIntoView(false)
    })
  },
)
</script>

<template>
  <div class="overflow-none mt-2 h-[550px] w-72 border border-gray-700">
    <div class="border-gray-600d max-h-full overflow-y-scroll border border-b-4" ref="selectAreaRef">
      <SearchInputUnit
        v-show="settype === 'kyara' || settype === 'kyast'"
        inputTitle="キャラ名やスタイル名で検索"
        @searchKyaraEvent="searchKyaraEvent"
        ref="refSearchString"
      />
      <div v-if="settype !== 'defo'" v-for="(item, index) in dateList" v-bind:key="item.uuid" :ref="selectKyaraRef">
        <div
          :class="actSet(item.uuid)"
          @click="setDataTypeClick(index, item)"
          v-if="
            settype === item.dataType &&
            isEditOpen !== item.uuid &&
            (settype !== 'seid'
              ? FindAllString(refSearchString.searchString, [item.name, settype === 'kyast' && item.kyaraStyle])
              : true)
          "
        >
          <!-- 個々の設定タイプに応じて表示 -->
          <div v-if="item.dataType === 'kyara'" class="w-5/6 truncate" :title="item.name">{{ item.name }}</div>
          <div v-else-if="item.dataType === 'kyast'" class="flex w-5/6">
            <div class="max-w-2/3 min-w-24 truncate" :title="item.name">{{ item.name }}</div>
            <div class="truncate" :title="item.kyaraStyle">（{{ item.kyaraStyle }}）</div>
          </div>
          <!-- 設定が有効で、字幕テキストファイルがある場合はその内容を表示 -->
          <div
            v-else-if="item.dataType === 'seid'"
            class="w-full truncate"
            :title="
              useSubText && subTextStringList[item.uuid].active
                ? subTextStringList[item.uuid].val
                : item.fileName + '.' + item.fileExtension
            "
          >
            {{ useSubText && subTextStringList[item.uuid].active ? subTextStringList[item.uuid].val : item.fileName }}
          </div>
          <div class="flex h-full" v-if="selectKyara === index && settype !== 'seid'">
            <MaterialIcons
              icon="MoreHoriz"
              @click.right="() => (isMenuOpen = true)"
              @click="() => console.log(kyaraRefs[index].offsetTop)"
              title="右クリックでメニュー表示"
            />
            <div v-show="isMenuOpen === true" class="sticky">
              <SelectDisplayKyaraRightClickMenu
                :clickClose="() => (isMenuOpen = false)"
                :CopyKyaraSetting="(settype: dataTextType) => CopyKyaraSetting(settype, item.uuid)"
                :editDataClik="() => editDataClik(item.uuid, item.name, item.kyaraStyle)"
                :askDeleteKyara="() => askDeleteKyara(index)"
              />
            </div>
          </div>
          <button
            class="h-full rounded-md border border-gray-700 bg-yellow-300"
            v-else-if="selectKyara === index && settype === 'seid'"
            title="エンコードを実行"
            @click.stop="encodeCliek(index)"
            :disabled="disableEnterEncode"
          >
            <MaterialIcons icon="CinematicBlur" />
          </button>
        </div>
        <AccEditKyaraName
          :isNewOpen="isEditOpen === item.uuid"
          accClass="mx-1"
          :onInData="onInData"
          :editKyaraName="item"
          :index="index"
          :kyast="settype === 'kyast'"
        />
      </div>
      <AccEditKyaraName
        :isNewOpen="isNewOpen"
        accClass="mx-1"
        :onInData="onInData"
        :editKyaraName="editKyaraName"
        :kyast="settype === 'kyast'"
      />
      <div v-if="settype === 'defo'" class="h-full w-full">
        <SelectProfileList
          classSetting="flex h-full flex-col px-1"
          :onChangeKyaraProfile="onChangeKyaraProfile"
          :inputProfileUUID="inputProfileUUID"
          :createProfileData="createProfileData"
          :selectAreaRef="selectAreaRef"
          ref="selectProfileListRef"
        />
      </div>
    </div>
    <div class="mx-1 mt-2 h-20" v-if="settype !== 'seid' && settype !== 'defo'">
      <!-- キャラ設定の追加 seid か defo 以外で表示 -->
      <div class="mx-1 mt-3 flex justify-between">
        <div>
          <div
            v-if="isNewOpen"
            class="mr-2 cursor-pointer rounded-full border border-gray-700 bg-gray-100 p-1 hover:bg-gray-300"
            @click="cancelEditKyaraData()"
          >
            キャンセル
          </div>
        </div>
        <!-- 入力欄が開いているときには確定ボタンになる -->
        <div
          class="mr-2 cursor-pointer rounded-full border border-gray-700 bg-blue-100 p-1 hover:bg-blue-300"
          @click="isNewOpen ? onInData() : newDataClik()"
        >
          {{ isNewOpen ? '追加' : '新規追加' }}
        </div>
      </div>
    </div>
  </div>
</template>
