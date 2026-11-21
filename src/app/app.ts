import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';
import { inject } from '@angular/core';
import { LoadingScreenComponent } from './shared/component/loading-screen/loading-screen/loading-screen.component';


@Component({
  imports: [RouterOutlet,LoadingScreenComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private themeService = inject(ThemeService);
  protected readonly title = signal('social_app');
}
