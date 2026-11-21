
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { LoadingScreenComponent } from './../../shared/component/loading-screen/loading-screen/loading-screen.component';
import { InputAppComponent } from '../../shared/component/input-app/input-app.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthServiceService } from '../../core/auth/services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputAppComponent,
    FooterComponent,
    ReactiveFormsModule,
    LoadingScreenComponent,
  ],
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  message: string = "I don't have an account? Sign up";
  linkText: string = 'Sign up';
  linkUrl: string = 'register';

  isLoding = false;

  // Forgot Password Modal
  showForgotMessage = false;

  private readonly authServiceService = inject(AuthServiceService);
  private readonly router = inject(Router);

  loginForm = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
        ),
      ]),
    },
    { updateOn: 'change' }
  );

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Open Forgot Password Modal
  showForgotPasswordMessage(): void {
    this.showForgotMessage = true;
  }

  // Close Forgot Password Modal
  closeForgotPasswordMessage(): void {
    this.showForgotMessage = false;
  }

  formLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoding = true;

    this.authServiceService.loginForm(this.loginForm.value).subscribe({
   next: (response) => {
  console.log('Login response:', response);

  const token = response.data?.token;

  if (!token) {
    console.error('Token not found:', response);
    this.isLoding = false;
    return;
  }

  localStorage.setItem('user', JSON.stringify(response.data));
  localStorage.setItem('token', token);

  this.router.navigate(['/home']).then((success) => {
    if (!success) {
      console.error('Navigation to Home failed');
      this.isLoding = false;
    }
  });
},

      error: (error) => {
        console.error('Login failed:', error);
        this.isLoding = false;
      },
    });
  }
}
