import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { checkTokenLogInGuard } from './check-token-log-in-guard';

describe('checkTokenLogInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => checkTokenLogInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
