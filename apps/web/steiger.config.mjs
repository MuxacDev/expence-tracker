import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Правило требует вливать в страницу слайс, который она одна использует. Auth-формы мы
      // сознательно держим в features. Выключить его точечно (files: ['./src/features/auth/**'])
      // нельзя: steiger 0.7 выкидывает эти файлы из подсчёта ссылок, и правило начинает ложно
      // ругаться на entities/user, который они импортируют.
      'fsd/insignificant-slice': 'off',
    },
  },
]);
