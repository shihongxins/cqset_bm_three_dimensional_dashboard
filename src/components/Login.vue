<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { request } from '@/apis/request';
  import { useUserStore } from '@/stores/user';

  const userStore = useUserStore();

  const captchaUrl = ref('');
  const getCaptcha = async () => {
    captchaUrl.value = '';
    const resData = await request.post('/sys/get_verify_code', {}, { responseType: 'blob' }).catch((err) => err);
    if (resData && resData.data instanceof Blob) {
      captchaUrl.value = URL.createObjectURL(resData.data);
    }
  };

  const loginFormData = ref({
    username: '',
    password: '',
    code: '',
  });

  const loginFormSubmit = (e) => {
    userStore
      .login(loginFormData.value)
      .catch((err) => err)
      .then((resData) => {
        console.log(resData);
      });
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    return false;
  };

  const userLogined = computed(() => {
    return Boolean(userStore.token && userStore.validate());
  });

  onMounted(() => {
    userStore.refresh();
    if (userLogined.value) {
      console.log('已登录');
    } else {
      getCaptcha();
    }
  });
</script>

<template>
  <div class="login-container" v-if="!userLogined">
    <form class="login-form" autocomplete="off" :onsubmit="loginFormSubmit">
      <label class="login-form-item">
        <span>
          账号
          <i class="i-local-icons:account"></i>
        </span>
        <input type="text" placeholder="请输入账号" autocomplete="off" required v-model="loginFormData.username" />
      </label>
      <label class="login-form-item">
        <span>
          密码
          <i class="i-local-icons:passkey"></i>
        </span>
        <input
          type="password"
          placeholder="请输入密码"
          autocomplete="new-password"
          required
          v-model="loginFormData.password"
        />
      </label>
      <label class="login-form-item">
        <span> 验证码 </span>
        <input
          type="text"
          placeholder="请输入验证码"
          autocomplete="off"
          required
          :minlength="4"
          :maxlength="4"
          v-model="loginFormData.code"
        />
        <div class="captcha-img--wrapper" @click="getCaptcha">
          <img alt="验证码" :src="captchaUrl" />
        </div>
      </label>
      <button class="login-form-btn">登录</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .login {
    &-container {
      position: fixed;
      inset: 0;
      z-index: 99;
      &::before,
      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        left: 0;
        height: 100%;
        width: 50%;
        background: rgba(66, 66, 66, 0.66);
      }
      &::after {
        left: auto;
        right: 0;
      }
    }
    &-form {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 2em;
      backdrop-filter: blur(3px);
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: 10px;
        transform: translate(-3px, -3px);
        background: radial-gradient(rgba(255, 255, 255, 0.7) 20%, transparent);
        filter: blur(15px);
      }
      &-item {
        margin-bottom: 1.5rem;
        width: 100%;
        display: flex;
        align-items: center;
        span {
          flex: 0 0 auto;
          width: 4em;
          height: 1.5em;
          line-height: 1.5em;
          font-size: 1.2em;
          color: #333;
        }
        input {
          flex: 1 1 auto;
          padding: 0.5em 1em;
          border: 1px solid #ddd;
          border-radius: 5px;
          &:invalid {
            border-color: #f33;
            &::placeholder {
              color: #f33;
            }
          }
          &:valid {
            border-color: #09f;
            &::placeholder {
              color: #09f;
            }
          }
          &:focus {
            outline: none;
            border-color: #09f;
            &::placeholder {
              color: transparent;
            }
          }
        }
      }
      &-btn {
        padding: 0.5em 1em;
        border: none;
        border-radius: 5px;
        width: 100%;
        box-sizing: border-box;
        background: #09f;
        color: #fff;
        cursor: pointer;
        &:hover {
          background: #069;
        }
      }
    }
  }
  .captcha-img--wrapper {
    height: 1.875rem;
    width: 6rem;
    flex: 0 0 auto;
    overflow: hidden;
    cursor: pointer;
    object-fit: fill;
    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
