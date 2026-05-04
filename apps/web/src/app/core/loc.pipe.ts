import { Pipe, PipeTransform } from '@angular/core';

import type { AppLang } from './locale.service';
import { t } from './i18n';

/** Pure: Angular memoizes by `key` + `lang` between change detection runs. */
@Pipe({
  name: 'loc',
  standalone: true,
  pure: true,
})
export class LocPipe implements PipeTransform {
  transform(key: string, lang: AppLang): string {
    return t(key, lang);
  }
}
