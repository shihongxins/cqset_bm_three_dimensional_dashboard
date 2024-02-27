import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from './useStorage';
import { request } from '@/apis/request';

const userStorage = useStorage('TPI-USER', 'sessionStorage');

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = computed(() => {
    let t = '';
    if (user.value) {
      t = user.value.token;
    }
    return t;
  });

  function refresh(userInfo) {
    const tempUserInfo = userInfo || userStorage.getItem('user');
    if (tempUserInfo) {
      const expiresAt = new Date(tempUserInfo.time) + 3 * 24 * 60 * 60 * 1000;
      if (expiresAt < new Date()) {
        userStorage.removeItem('user');
      } else {
        userStorage.setItem('user', tempUserInfo);
      }
    }
    user.value = userStorage.getItem('user');
  }

  function validate() {
    if (token.value) {
      const expiresAt = new Date(user.value.time) + 3 * 24 * 60 * 60 * 1000;
      if (expiresAt < new Date()) {
        refresh();
      }
    }
    return Boolean(token.value);
  }

  async function login(userInfo = {}) {
    if (!(userInfo.username && userInfo.password && userInfo.code)) {
      return Promise.reject(new Error('用户信息不完整'));
    }
    const resData = await request.post('/sys/login', userInfo).catch((reason) => reason);
    if (resData?.code === 200) {
      userStorage.setItem('user', resData.data);
    }
    refresh(resData.data);
    return resData;
  }

  function logout() {
    userStorage.removeItem('user');
    refresh();
    return true;
  }

  return {
    user,
    token,
    refresh,
    validate,
    login,
    logout,
  };
});
