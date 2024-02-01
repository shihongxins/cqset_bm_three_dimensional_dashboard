import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from './useStorage';

const userStorage = useStorage('TPI-USER', 'localStorage');

export const useUserStore = defineStore('user', () => {
  const user = ref();
  const token = computed(() => {
    let t = '';
    if (user.value) {
      t = user.value.token;
    }
    return t;
  });

  function refresh() {
    user.value = userStorage.getItem('user');
  }

  return {
    user,
    token,
    refresh,
  };
});
