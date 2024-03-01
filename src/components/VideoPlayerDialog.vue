<script setup>
  import { request } from '@/apis/request';
  import { useFullscreenEffect } from '@/composables/useFullscreenEffect';
  import { ref, computed } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  });
  const emits = defineEmits(['update:modelValue']);
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const playlist = ref([]);
  const page = ref(1);
  const loading = ref(false);
  const finished = ref(false);
  const disabled = computed(() => loading.value || finished.value);

  async function fetchPlaylist() {
    if (finished.value || loading.value) return;
    loading.value = true;
    const resData = await request.post('/project_camera/list', {
      spare_id: props.project?.id,
      keyword: '',
      page: page.value,
      size: 10,
      sort: 'desc',
    });
    loading.value = false;
    if (resData?.code === 200) {
      const list = resData.data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleString(),
      }));
      playlist.value = [...playlist.value, ...list];
      page.value += 1;
      if (playlist.value.length >= resData.total) {
        finished.value = true;
      }
      if (currentItemIndex.value === -1) {
        playVideo(playlist.value[0]);
      }
    }
  }

  const currentItemIndex = ref(-1);
  function playVideo(item) {
    const index = playlist.value.findIndex((i) => i.id === item.id);
    if (index !== -1 && index !== currentItemIndex.value) {
      currentItemIndex.value = index;
    }
  }

  const currentPlayURL = computed(() => {
    let url = '';
    if (currentItemIndex.value !== -1) {
      url = __APP_RESOURCE_URL__ + '/' + playlist.value[currentItemIndex.value].path;
      // url = 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo-720p.mp4';
    }
    return url;
  });

  const currentTitle = computed(() => {
    const projectName = props.project?.name || '';
    let title = '无视频播放';
    if (currentItemIndex.value !== -1) {
      const currentItem = playlist.value[currentItemIndex.value];
      title = `${projectName} - ${currentItem.created_at} - ${currentItem.name}`;
    }
    return title;
  });

  const refPlayer = ref(null);
  const { fullscreenAttrs, toggle: toggleFullscreen } = useFullscreenEffect(refPlayer);

  function refreshPlayInfo() {
    resetPlayInfo();
    fetchPlaylist();
  }

  function resetPlayInfo() {
    playlist.value = [];
    page.value = 1;
    finished.value = false;
    currentItemIndex.value = -1;
  }
</script>

<template>
  <ElDialog
    class="el-dialog-layout--noheader"
    v-model="visible"
    :show-close="false"
    destroy-on-close
    @open="refreshPlayInfo"
    @close="resetPlayInfo"
  >
    <div class="player" un-p-2 un-h-50vh un-overflow-hidden un-flex un-flex-wrap ref="refPlayer">
      <div un-rounded un-px-2 un-h-8 un-w-full un-overflow-hidden un-bg-stone-800 un-flex un-items-center>
        <h4 un-m-2 un-flex-1 un-text-truncate un-text-stone>
          {{ currentTitle }}
        </h4>
        <div un-text-lg un-text-stone un-cursor-pointer>
          <a v-bind="fullscreenAttrs" @click="toggleFullscreen"></a>
          <a class="i-local-icons:close" title="关闭" @click="visible = false"></a>
        </div>
      </div>
      <div class="player__video--wrapper" un-flex-1 un-overflow-hidden>
        <video controls muted autoplay loop un-w-full un-h-full :src="currentPlayURL"></video>
      </div>
      <aside class="player__aside" un-w-50 un-flex un-flex-col un-bg-stone-900 un-color-stone-400>
        <h6 un-m-0 un-text-lg un-text-center un-font-normal>播放列表</h6>
        <ul
          class="playlist"
          un-flex-1
          un-m-2
          un-p-0
          un-list-none
          un-overflow-x-hidden
          un-overflow-y-auto
          v-infinite-scroll="fetchPlaylist"
          :infinite-scroll-disabled="disabled"
        >
          <li
            class="playlist__item"
            un-m-2
            un-rounded
            un-p-2
            un-text-truncate
            un-bg-stone-700
            un-cursor-pointer
            v-for="(item, index) in playlist"
            :key="item.id"
            :class="{ active: index === currentItemIndex }"
            @click="playVideo(item)"
          >
            {{ item.name }}
          </li>
        </ul>
      </aside>
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
  .playlist {
    &__item {
      &.active,
      &:hover {
        @apply bg-stone-600 color-green-600;
      }
    }
  }
</style>
