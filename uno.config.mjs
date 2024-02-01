import {
  defineConfig,
  presetUno,
  presetIcons,
  presetAttributify,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import { readFile } from 'node:fs/promises';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      autoInstall: true,
      collections: {
        'local-icons': async (iconName) => {
          return readFile('./src/assets/icons/svgs/' + iconName + '.svg', 'utf-8');
        },
      },
    }),
    presetAttributify({
      prefix: 'un-',
      prefixedOnly: true,
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
