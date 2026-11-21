
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuggestFriendService {

  private readonly http = inject(HttpClient);

  private getAuthOptions() {
    const token = localStorage.getItem('token');

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  getSuggestions(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(
      `${environment.baseurl}/users/suggestions?page=${page}&limit=${limit}`,
      this.getAuthOptions()
    );
  }


followUser(userId: string): Observable<any> {
  return this.http.put(
    `${environment.baseurl}/users/${userId}/follow`,
    {},
    this.getAuthOptions()
  );
}

unfollowUser(userId: string): Observable<any> {
  return this.http.put(
    `${environment.baseurl}/users/${userId}/follow`,
    {},
    this.getAuthOptions()
  );
}

}
