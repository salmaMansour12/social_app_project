
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';

import { AsyncPipe } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { Subscription, interval } from 'rxjs';

import {
  AuthServiceService,
} from '../../core/auth/services/auth-service.service';

import {
  NotificationService,
} from '../../notification-services.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {

  private authService = inject(AuthServiceService);
  private notificationService = inject(NotificationService);

  unreadCount$ = this.notificationService.unreadCount$;

  private notificationSubscription?: Subscription;

  profileDropdownOpen = false;
  menuDropdownOpen = false;

  currentUser: any = null;

  ngOnInit(): void {
    this.getCurrentUser();

    this.notificationService.refreshUnreadCount();

    this.notificationSubscription = interval(30000).subscribe(() => {
      this.notificationService.refreshUnreadCount();
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  getCurrentUser(): void {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      this.currentUser =
        savedUser?.data?.user ??
        savedUser?.user ??
        savedUser?.data ??
        savedUser;

    } catch (error) {
      console.error('Navbar User Error:', error);
      this.currentUser = null;
    }
  }

  get profileName(): string {
    return this.currentUser?.name || 'My Profile';
  }

  get profilePhoto(): string {
    return (
      this.currentUser?.photo ||
      'https://ui-avatars.com/api/?name=My+Profile&background=7c3aed&color=fff'
    );
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    this.menuDropdownOpen = false;
  }

  toggleMenuDropdown(): void {
    this.menuDropdownOpen = !this.menuDropdownOpen;
    this.profileDropdownOpen = false;
  }

  closeDropdowns(): void {
    this.profileDropdownOpen = false;
    this.menuDropdownOpen = false;
  }

  logoutnavbar(): void {
    this.authService.logout();
  }
}
