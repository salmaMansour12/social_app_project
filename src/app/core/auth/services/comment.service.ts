
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  currentLanguage: AppLanguage = 'en';

  init(): void {
    const savedLanguage = localStorage.getItem('app-language');

    const language: AppLanguage =
      savedLanguage === 'ar' ? 'ar' : 'en';

    this.translate.setFallbackLang('en');
    this.setLanguage(language);
  }

  setLanguage(language: AppLanguage): void {
    this.currentLanguage = language;

    localStorage.setItem('app-language', language);

    this.translate.use(language);

    this.document.documentElement.lang = language;
    this.document.documentElement.dir =
      language === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const newLanguage: AppLanguage =
      this.currentLanguage === 'en' ? 'ar' : 'en';

    this.setLanguage(newLanguage);
  }

  get isArabic(): boolean {
    return this.currentLanguage === 'ar';
  }
}
