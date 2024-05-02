<script setup lang="ts">
// プロファイルのリストを表示し、
// 選択することで切り替えられるようにする。

const props = defineProps<{
  onChangeKyaraProfile: (uuid: string) => void
  inputProfileUUID: string
  classSetting?: string
  selectAreaRef: HTMLDivElement
  createProfileData: (copyUuid: boolean) => Promise<string>
}>()

import { ref, watch, nextTick } from 'vue'
import { kyaraProfileListType } from '@/type/data-type'
import {
  getKyaraProfileList,
  AddListNewKyaraProfile,
  RemoveListKyaraProfile,
  writeKyaraProfileList,
} from '@/utils/analysisData'
import type { deleteDialogRefType } from '@/components/accessories/deleteDialog.vue'
import MaterialIcons from '@/components/accessories/icons/MaterialIcons.vue'
import { MakeClassString } from '@/utils/analysisGeneral'
import { DEFAULT_KYARA_PROFILE_NAME } from '@/data/data'
import deleteDialog from '@/components/accessories/deleteDialog.vue'
import AccEditProfileName from '@/components/accessories/AccEditProfileName.vue'

// 削除のダイアログ内容を指定
const deleteDialogRef = ref<deleteDialogRefType>({
  deleteMessage: '削除しますか？',
  deleteButtonTitle: '削除',
  deleteTitle: ' プロファイル削除',
})
const isDeleteDialogOpen = ref<boolean>(false)

// プロファイル名の変更操作。
const isEditOpen = ref<boolean>(false)

// キャラ設定プロファイルのリストを取得
const kyaraProfileList = ref<kyaraProfileListType[]>(getKyaraProfileList())

// リストの各項目にrefを設定する
const profileRefs = ref<HTMLDivElement[]>([])
const selectProfileRef = (e: HTMLDivElement) => {
  // 存在するか＆重複があるかかくにんする
  if (e && !profileRefs.value.includes(e)) {
    profileRefs.value.push(e)
  }
}

// キャラ設定プロファイルを新規作成かコピーする。
// copyStaがtrueなら現在選択中のプロファイルをコピーする
// 作成したプロファイルのUUIDが出力されるので、それを追加する
const newProfile = async (copySta: boolean): Promise<void> => {
  const uuid = await props.createProfileData(copySta)
  props.onChangeKyaraProfile(uuid)
  await AddListNewKyaraProfile(kyaraProfileList.value, uuid)

  // リストを再度読み込む
  const reloadProfile = async (): Promise<void> => {
    kyaraProfileList.value = getKyaraProfileList()
  }
  reloadProfile().then(() => {
    // 一番下までスクロールする
    nextTick(() => {
      props.selectAreaRef.scrollTop = props.selectAreaRef.scrollHeight
    })
  })
}

// キャラ設定プロファイルを削除する。
const delProfile = async (uuid: string): Promise<void> => {
  await RemoveListKyaraProfile(kyaraProfileList.value, uuid).then(() => {
    // 削除したプロファイルの一つ前を選択する
    const index = kyaraProfileList.value.findIndex((e) => e.uuid === uuid)
    props.onChangeKyaraProfile(kyaraProfileList.value[index !== 0 ? index - 1 : index].uuid)
  })

  // リストを再度読み込む
  kyaraProfileList.value = getKyaraProfileList()
}

//プロファイル削除の確認ダイアログをひらく
const askDeleteKyara = (): void => {
  deleteDialogRef.value = {
    ...deleteDialogRef.value,
    deleteMessage: `${
      kyaraProfileList.value.find((e) => e.uuid === props.inputProfileUUID).displayName ?? ''
    } を削除しますか？`,
  }
  isDeleteDialogOpen.value = true
}

// プロファイル名変更状態を変更する
const setEditOpen = (item: kyaraProfileListType): void => {
  if (item.uuid === props.inputProfileUUID) {
    isEditOpen.value = !isEditOpen.value
  }
}

// キャラ設定プロファイル名を書き込む（変更）する。
const editProfile = async (): Promise<void> => {
  await writeKyaraProfileList(kyaraProfileList.value)
  isEditOpen.value = false
}

// 表示後に現在選択中のプロファイル項目を表示するようにスクロールする
nextTick(() => {
  const selectDiv = kyaraProfileList.value.findIndex((e) => e.uuid === props.inputProfileUUID)
  profileRefs.value[selectDiv].scrollIntoView(false)
})

// newProfile を親コンポーネントから呼び出せるようにします
defineExpose({ newProfile })
</script>

<template>
  <div :class="classSetting">
    <div
      v-for="item in kyaraProfileList"
      :key="item.uuid"
      :class="
        MakeClassString(
          'mt-1 flex h-9 w-full items-center justify-between rounded border border-gray-700 p-1',
          inputProfileUUID === item.uuid ? 'bg-lime-400' : 'bg-slate-300',
        )
      "
      :ref="selectProfileRef"
    >
      <div
        class="flex w-4/5 items-center justify-between"
        v-if="!isEditOpen || inputProfileUUID !== item.uuid"
        @dblclick="() => setEditOpen(item)"
      >
        <button @click.stop="onChangeKyaraProfile(item.uuid)" :disabled="inputProfileUUID === item.uuid">
          <MaterialIcons
            :icon="inputProfileUUID === item.uuid ? 'RadioButtonChecked' : 'RadioButtonUnchecked'"
            classString="h-full"
          />
        </button>
        <div class="ml-1 w-full truncate" :title="item.displayName">
          {{ item.displayName }}
        </div>
      </div>
      <AccEditProfileName
        v-else-if="inputProfileUUID === item.uuid && isEditOpen"
        classSetting="w-4/5"
        :editProfile="item"
        :onChange="() => editProfile()"
      />
      <div v-if="inputProfileUUID === item.uuid">
        <button title="コピーを作成" @click.stop="newProfile(true)">
          <MaterialIcons icon="PhotoLibrary" />
        </button>
        <!-- DEFAULT_KYARA_PROFILE_NAME は削除させない -->
        <button v-if="item.uuid !== DEFAULT_KYARA_PROFILE_NAME" title="削除" @click.stop="askDeleteKyara()">
          <MaterialIcons icon="Delete" />
        </button>
      </div>
    </div>
    <deleteDialog
      :deleteTitle="deleteDialogRef.deleteTitle"
      :clickClose="() => (isDeleteDialogOpen = false)"
      :deleteButtonTitle="deleteDialogRef.deleteButtonTitle"
      :deleteMessage="deleteDialogRef.deleteMessage"
      :uuid="inputProfileUUID"
      :deleteProfile="delProfile"
      v-if="isDeleteDialogOpen"
    />
  </div>
</template>
