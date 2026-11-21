
import { Routes } from '@angular/router';

import { MainComponent } from './layout/main/main.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AuthlayoutComponent } from './layout/authlayout/authlayout.component';
import { RegisterComponent } from './features/register/register.component';
import { NotificationComponent } from './features/notification/notification.component';
import { MyProfileComponent } from './features/my-profile/my-profile.component';
import { SettingsComponent } from './setting/setting.component';
import { checkTokenLogInGuard } from './core/auth/guard/check-token-log-in-guard';
import { logoutGuardGuard } from './core/auth/guard/logout-guard-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // MAIN LAYOUT
  {
    path: '',
    canActivate: [checkTokenLogInGuard],
    component: MainComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'notification',
        component: NotificationComponent
      },
      {
        path: 'my-profile',
        component: MyProfileComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  },

  // AUTH LAYOUT
  {
    path: '',
    component: AuthlayoutComponent,
    canActivate: [logoutGuardGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      }
    ]
  },

  {
    path: '**',
    component: NotFoundComponent
  }
];
