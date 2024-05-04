<script setup lang="ts">
defineProps<{
  classString?: string
  icon: iconsType
  titleString?: string
}>()

type iconsType =
  | 'Circle'
  | 'InstantMixWght600'
  | 'EmojiPeopleOpsz40'
  | 'Add'
  | 'Edit'
  | 'Delete'
  | 'Close'
  | 'ArrowBack400024'
  | 'ArrowForward400024'
  | 'RadioButtonChecked'
  | 'RadioButtonUnchecked'
  | 'FolderOpen'
  | 'Task'
  | 'AddCircle'
  | 'PersonOff'
  | 'Person'
  | 'PhotoLibrary'
  | 'Save'
  | 'InterpreterMode'
  | 'ContactPage'
  | 'CinematicBlur'
  | 'MoreHoriz'
  | 'AddPhotoAlternate'

const iconaView: { [key in iconsType]: string } = {
  Circle: 'circle.svg',
  InstantMixWght600: 'instant_mix_wght600.svg',
  EmojiPeopleOpsz40: 'emoji_people_opsz40.svg',
  Add: 'add.svg',
  Edit: 'edit.svg',
  Delete: 'delete_FILL0_wght400_GRAD0_opsz24.svg',
  Close: 'close_FILL0_wght400_GRAD0_opsz24.svg',
  ArrowBack400024: 'arrow_back_FILL0_wght400_GRAD0_opsz24.svg',
  ArrowForward400024: 'arrow_forward_FILL0_wght400_GRAD0_opsz24.svg',
  RadioButtonChecked: 'radio_button_checked_FILL0_wght700_GRAD0_opsz24.svg',
  RadioButtonUnchecked: 'radio_button_unchecked_FILL0_wght700_GRAD0_opsz24.svg',
  FolderOpen: 'folder_open_FILL0_wght400_GRAD0_opsz24.svg',
  Task: 'task_FILL0_wght400_GRAD0_opsz24.svg',
  AddCircle: 'add_circle_FILL0_wght400_GRAD0_opsz24.svg',
  PersonOff: 'person_off_FILL0_wght400_GRAD0_opsz24.svg',
  Person: 'person_FILL0_wght400_GRAD0_opsz24.svg',
  PhotoLibrary: 'photo_library_FILL0_wght400_GRAD0_opsz24.svg',
  Save: 'save_FILL0_wght400_GRAD0_opsz24.svg',
  InterpreterMode: 'interpreter_mode_FILL0_wght400_GRAD0_opsz24.svg',
  ContactPage: 'contact_page_FILL0_wght400_GRAD0_opsz24.svg',
  CinematicBlur: 'cinematic_blur_FILL0_wght400_GRAD0_opsz24.svg',
  MoreHoriz: 'more_horiz_FILL0_wght400_GRAD0_opsz24.svg',
  AddPhotoAlternate: 'add_photo_alternate_FILL0_wght400_GRAD0_opsz24.svg',
}
</script>

<template>
  <div :class="classString" :title="titleString">
    <img :src="'./MaterialIcons/' + iconaView[icon]" class="h-full w-full" />
  </div>
</template>
