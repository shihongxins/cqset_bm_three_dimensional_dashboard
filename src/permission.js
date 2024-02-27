import { pinia } from './stores';
import { request } from './apis/request';
import { errorHandler, useHandleResponseBlob } from './apis/request/tools';
import { router } from './router';
import { useUserStore } from './stores/user';

const userStore = useUserStore(pinia);

request.whiteList = ['/sys/login', '/sys/get_verify_code'];

request.interceptors.request.use((config) => {
  const { userRequestInterceptorsConfig } = config;
  if (userRequestInterceptorsConfig?.request?.enable) {
    if (userRequestInterceptorsConfig?.request?.validToken) {
      const isTokenRequired = !(config.headers['token'] || request.whiteList.indexOf(config.url) > -1);
      if (isTokenRequired) {
        const tokenValid = userStore.validate();
        if (tokenValid) {
          request.defaults.headers.common['token'] = userStore.token;
          config.headers['token'] = userStore.token;
        } else {
          delete request.defaults.headers.common['token'];
          delete config.headers['token'];
          // router.push('/login');
          return Promise.reject(errorHandler.auth({}, null, null, 'Token 已过期，请重新登录'));
        }
      }
    }
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const { userRequestInterceptorsConfig } = response.config;
    if (userRequestInterceptorsConfig?.response?.enable) {
      let resData = response;
      if (userRequestInterceptorsConfig?.response?.autoDeconstructionData) {
        resData = useHandleResponseBlob(response, 'tempfile_' + Date.now());
        if (!resData.data || resData.code === -1) {
          resData = response.data;
        }
      }
      return resData;
    }
    return response;
  },
  (error) => {
    const { userRequestInterceptorsConfig } = error.config;
    let err = error;
    if (userRequestInterceptorsConfig?.response?.enable) {
      err = userRequestInterceptorsConfig?.response?.autoDeconstructionData ? errorHandler.network(error) : error;
    }
    return Promise.reject(err);
  }
);

router.whiteList = [
  // '/login'
];

router.beforeEach((to, from, next) => {
  const isLogined = userStore.validate();
  if (isLogined) {
    // if (to.path === '/login') {
    //   next({ path: '/' });
    // }
  } else {
    let inRouterWhiteList = !!router.whiteList.filter((route) => route.name === to.name || route.path === to.path)
      .length;
    if (!inRouterWhiteList) {
      // next({ name: 'Login' });
    }
  }
  next();
});
