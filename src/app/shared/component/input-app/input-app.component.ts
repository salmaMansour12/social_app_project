import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ErroMessageComponent } from '../erro-message/erro-message.component';

@Component({
  selector: 'app-input-app',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErroMessageComponent,
  ],
  templateUrl: './input-app.component.html',
  styleUrl: './input-app.component.css',
})
export class InputAppComponent {
  @Input() label = '';
  @Input() name = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() control: AbstractControl | null = null;

  passwordVisible = false;

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  get inputType(): string {
    if (this.type === 'password') {
      return this.passwordVisible ? 'text' : 'password';
    }

    return this.type;
  }
}