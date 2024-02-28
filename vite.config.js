import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const __APP_RESOURCE_URL__ = JSON.stringify(mode === 'development' ? env.VITE_ORIGIN : 'window.origin');
  console.log('import.meta', mode, import.meta, env, __APP_RESOURCE_URL__);
  return {
    base: env.VITE_BASE,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      vue(),
      eslintPlugin(),
      UnoCSS(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    css: {
      preprocessorOptions: {
        sass: {},
      },
      postcss: 'postcss.config.cjs',
    },
    server: {
      proxy: {
        [env.VITE_API_BASE_PATH]: {
          target: env.VITE_ORIGIN,
          changeOrigin: true,
        },
      },
    },
    define: {
      __APP_RESOURCE_URL__,
    },
  };
});
