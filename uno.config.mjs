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
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        'line-height': 1,
        position: 'relative',
        top: '-0.125em',
      },
    }),
    presetAttributify({
      prefix: 'un-',
      prefixedOnly: true,
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
