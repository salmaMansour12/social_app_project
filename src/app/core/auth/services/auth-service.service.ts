import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  registerFormService(data: object): Observable<any> {
    return this.httpClient.post(
      `${environment.baseurl}/users/signup`,
      data
    );
  }

  loginForm(data: object): Observable<any> {
    return this.httpClient.post(
      `${environment.baseurl}/users/signin`,
      data
    );
  }
  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    console.log("User logged out successfully.");
  }
changePassword(data: ChangePasswordRequest): Observable<any> {
  return this.httpClient.patch<any>(
    `${environment.baseurl}/users/change-password`,
    data
  );
}
}

export interface ChangePasswordRequest {
  password: string;
  newPassword: string;
}
