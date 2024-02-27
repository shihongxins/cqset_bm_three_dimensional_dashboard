import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log('import.meta', import.meta, env);
  return {
    base: env.VITE_BASE,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [vue(), eslintPlugin(), UnoCSS(), AutoImport(), Components()],
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
  };
});
