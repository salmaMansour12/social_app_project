
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthServiceService } from '../core/auth/services/auth-service.service';
import { environment } from '../../environments/environment';
import { ThemeMode, ThemeService } from '../theme.service';

// ================= TYPES =================

type SettingsSection =
  | 'account'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'blocked';

interface UserProfile {
  _id?: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover?: string;
  phone?: string;
  about?: string;
}

// ================= COMPONENT =================

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './setting.component.html',
})
export class SettingsComponent implements OnInit {

  // ================= INJECTIONS =================

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthServiceService);
  private readonly themeService = inject(ThemeService);

  private readonly baseUrl = environment.baseurl.replace(/\/$/, '');

  // ================= SETTINGS =================

  activeSection: SettingsSection = 'account';
  currentTheme: ThemeMode = 'light';

  // ================= PROFILE =================

  profile: UserProfile = {
    name: '',
    username: '',
    email: '',
    photo: '',
    cover: '',
    phone: '',
    about: '',
  };

  originalProfile: UserProfile = { ...this.profile };

  isLoading = false;
  isUploadingPhoto = false;

  selectedPhoto: File | null = null;
  previewPhoto = '';

  // ================= TOAST =================

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private toastTimeout?: ReturnType<typeof setTimeout>;

  // ================= PASSWORD =================

  isChangingPassword = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Password match validator
  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {

    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword
      ? null
      : { passwordMismatch: true };
  };

  changePasswordForm = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
      ]),

      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).+$/
        ),
      ]),

      confirmPassword: new FormControl('', [
        Validators.required,
      ]),
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  get passwordControls() {
    return this.changePasswordForm.controls;
  }

  // ================= PASSWORD REQUIREMENTS =================

  get newPasswordValue(): string {
    return this.passwordControls.newPassword.value ?? '';
  }

  get showPasswordRequirements(): boolean {
    return this.passwordControls.newPassword.dirty &&
      this.newPasswordValue.length > 0;
  }

  get passwordRequirements() {
    const password = this.newPasswordValue;

    return [
      {
        label: 'At least 8 characters',
        valid: password.length >= 8,
      },
      {
        label: 'One uppercase letter (A-Z)',
        valid: /[A-Z]/.test(password),
      },
      {
        label: 'One lowercase letter (a-z)',
        valid: /[a-z]/.test(password),
      },
      {
        label: 'At least one number',
        valid: /[0-9]/.test(password),
      },
      {
        label: 'At least one special character',
        valid: /[#?!@$%^&*-]/.test(password),
      },
    ];
  }

  // ================= LIFECYCLE =================

  ngOnInit(): void {
    this.currentTheme = this.themeService.getTheme();

    this.loadLocalUser();
    this.getProfileData();
  }

  // ================= AUTH HEADERS =================

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  // ================= PROFILE LOCAL DATA =================

  private loadLocalUser(): void {
    try {
      const savedUser = localStorage.getItem('user');

      if (!savedUser) return;

      const parsedUser = JSON.parse(savedUser);

      const user =
        parsedUser?.data?.user ??
        parsedUser?.user ??
        parsedUser?.data ??
        parsedUser;

      this.profile = {
        _id: user?._id ?? '',
        name: user?.name ?? '',
        username: user?.username ?? '',
        email: user?.email ?? '',
        photo: user?.photo ?? '',
        cover: user?.cover ?? '',
        phone: user?.phone ?? '',
        about: user?.about ?? '',
      };

      this.originalProfile = { ...this.profile };

    } catch (error) {
      console.error('Error reading user data:', error);
    }
  }

  private saveUserLocally(user: any): void {
    try {
      const savedUser = localStorage.getItem('user');

      const parsedUser = savedUser
        ? JSON.parse(savedUser)
        : {};

      const currentUser =
        parsedUser?.data?.user ??
        parsedUser?.user ??
        parsedUser?.data ??
        parsedUser;

      const updatedUser = {
        ...currentUser,
        ...user,
      };

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      );

    } catch (error) {
      console.error('Could not update local user:', error);
    }
  }

  // ================= GET PROFILE =================

  getProfileData(): void {
    this.isLoading = true;

    this.http
      .get<any>(
        `${this.baseUrl}/users/profile-data`,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({
        next: (response) => {

          const user =
            response?.data?.user ??
            response?.data ??
            response?.user ??
            response;

          if (user) {
            this.profile = {
              ...this.profile,

              _id: user._id ?? this.profile._id,
              name: user.name ?? this.profile.name,
              username: user.username ?? this.profile.username,
              email: user.email ?? this.profile.email,
              photo: user.photo ?? this.profile.photo,
              cover: user.cover ?? this.profile.cover,
              phone: user.phone ?? this.profile.phone,
              about: user.about ?? this.profile.about,
            };

            this.originalProfile = { ...this.profile };

            this.saveUserLocally(user);
          }

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Profile request failed:', error);

          this.isLoading = false;

          this.showToast(
            error?.error?.message ?? 'Could not load profile data',
            'error'
          );
        },
      });
  }

  // ================= CHANGE PASSWORD =================

  changePassword(): void {

    if (this.changePasswordForm.invalid || this.isChangingPassword) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { password, newPassword } =
      this.changePasswordForm.getRawValue();

    this.isChangingPassword = true;

    this.http.patch<any>(
      `${this.baseUrl}/users/change-password`,
      {
        password,
        newPassword,
      },
      {
        headers: this.getHeaders(),
      }
    ).subscribe({

      next: (response) => {

        console.log('Change password response:', response);

        const refreshedToken =
          response?.data?.token ??
          response?.token ??
          response?.data?.accessToken ??
          response?.accessToken;

        if (refreshedToken) {
          localStorage.setItem('token', refreshedToken);
        }

        this.isChangingPassword = false;

        this.resetPasswordForm();

        this.showToast(
          'Your password has been changed successfully!',
          'success'
        );
      },

      error: (error) => {

        console.error('Change password error:', error);

        this.isChangingPassword = false;

        this.showToast(
          error?.error?.message ??
          'Could not change password. Please check your current password.',
          'error'
        );
      },

    });
  }

  // ================= RESET PASSWORD FORM =================

  resetPasswordForm(): void {

    this.changePasswordForm.reset();

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // ================= PROFILE PHOTO =================

  onPhotoSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      this.showToast(
        'Please choose an image file',
        'error'
      );

      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {

      this.showToast(
        'Image size must be less than 5MB',
        'error'
      );

      input.value = '';
      return;
    }

    this.clearPhotoPreview();

    this.selectedPhoto = file;
    this.previewPhoto = URL.createObjectURL(file);
  }

  uploadPhoto(): void {

    if (
      !this.selectedPhoto ||
      this.isUploadingPhoto
    ) {
      return;
    }

    const formData = new FormData();

    formData.append('photo', this.selectedPhoto);

    this.isUploadingPhoto = true;

    this.http
      .put<any>(
        `${this.baseUrl}/users/upload-photo`,
        formData,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({

        next: (response) => {

          const user =
            response?.data?.user ??
            response?.data ??
            response?.user ??
            response;

          const newPhoto =
            user?.photo ??
            user?.user?.photo ??
            response?.photo;

          if (newPhoto) {

            this.profile.photo = newPhoto;

            this.saveUserLocally({
              ...user,
              photo: newPhoto,
            });

            this.originalProfile = {
              ...this.profile,
            };
          }

          this.isUploadingPhoto = false;

          this.cancelPhotoSelection();

          this.showToast(
            'Profile photo updated successfully',
            'success'
          );

          this.getProfileData();
        },

        error: (error) => {

          console.error('Photo upload failed:', error);

          this.isUploadingPhoto = false;

          this.showToast(
            error?.error?.message ??
            'Could not upload profile photo',
            'error'
          );
        },

      });
  }

  cancelPhotoSelection(): void {

    this.selectedPhoto = null;

    this.clearPhotoPreview();
  }

  private clearPhotoPreview(): void {

    if (this.previewPhoto) {

      URL.revokeObjectURL(this.previewPhoto);

      this.previewPhoto = '';
    }
  }

  // ================= PROFILE CHANGES =================

  cancelChanges(): void {

    this.profile = {
      ...this.originalProfile,
    };

    this.cancelPhotoSelection();
  }

  saveChanges(): void {

    // لا يوجد endpoint مؤكد لتعديل بيانات البروفايل النصية حتى الآن.

    this.showToast(
      'Profile update API is not connected yet',
      'error'
    );
  }

  // ================= THEME =================

  setTheme(theme: ThemeMode): void {

    this.themeService.setTheme(theme);

    this.currentTheme = theme;

    this.showToast(
      theme === 'dark'
        ? 'Dark mode enabled'
        : 'Light mode enabled',
      'success'
    );
  }

  // ================= NAVIGATION =================

  changeSection(section: SettingsSection): void {
    this.activeSection = section;
  }

  // ================= LOGOUT =================

  logout(): void {
    this.authService.logout();
  }

  // ================= TOAST =================

  showToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {

    this.toastMessage = message;
    this.toastType = type;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
