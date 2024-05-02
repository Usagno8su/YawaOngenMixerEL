<script setup lang="ts">
defineProps<{
  classString?: string
}>()
</script>

<template>
  <div :class="classString">
    <div class="mb-2 ml-2 text-2xl font-bold">「やわ音原ミキサー」について</div>
    <div class="m-2">
      <div class="text-xl font-medium">概要</div>
      <div class="mx-2 mt-1">
        本ソフトは、予め用意した音声合成ソフトの音声、その字幕および立ち絵を合成し、WebM形式の動画を作成します。
      </div>
      <div class="mt-3 text-xl font-medium">ライセンス</div>
      <div class="mx-2 mt-1">
        <div>このやわ音原ミキサーは MIT ライセンスです。</div>
        <div>ただ、付属するライブラリについては、それらのライセンスに準拠した対応を行ってください。</div>
      </div>
      <div class="mt-3 text-xl font-medium">公式サイト</div>
      <div class="mx-2 mt-1">https://yawaongen-mixer.org/</div>
      <div class="mt-3 text-xl font-medium">GitHub</div>
      <div class="mx-2 mt-1">https://github.com/Usagno8su/YawaOngenMixerEL</div>
    </div>
    <div class="mx-2 mt-3">copyright © 兎のあす.</div>
  </div>
</template>
