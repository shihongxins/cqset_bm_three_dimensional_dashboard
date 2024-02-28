// @unocss-include
import { computed } from 'vue';
import { useFullscreen } from '@vueuse/core';

export const useFullscreenEffect = (elem = document.documentElement) => {
  const { isSupported, isFullscreen, enter, exit, toggle } = useFullscreen(elem);
  const fullscreenAttrs = computed(() => ({
    title: isFullscreen.value ? '退出全屏' : '进入全屏',
    class: isFullscreen.value ? 'i-local-icons:fullscreen-exit' : 'i-local-icons:fullscreen',
  }));

  return {
    isSupported,
    isFullscreen,
    enter,
    exit,
    toggle,
    fullscreenAttrs,
  };
};
