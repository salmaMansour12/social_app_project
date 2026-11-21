
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  constructor() {
    this.initTheme();
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    this.setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {
    const root = this.document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }

  getTheme(): ThemeMode {
    return this.document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  }
}
