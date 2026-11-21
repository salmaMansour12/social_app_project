import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const checkTokenLogInGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  if (localStorage.getItem('token')) {
    return true;
  } else {
    return router.parseUrl('/login');
  }

};
