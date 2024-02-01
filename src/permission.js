import { pinia } from './stores';
import { request } from './apis/request';
import { router } from './router';
import { useUserStore } from './stores/user';

const userStore = useUserStore(pinia);

request.interceptors.request.use((config) => {
  return config;
});

router.beforeEach((to, from, next) => {
  const valid = userStore.token;
  console.log(valid);
  // if (to.name === 'Login') {
  //   if (valid) {
  //     return next({ path: '/' });
  //   }
  // } else if (!valid) {
  //   return next({ name: 'Login' });
  // }
  next();
});
