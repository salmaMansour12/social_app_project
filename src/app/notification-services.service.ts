
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  private baseUrl = environment.baseurl;

  private unreadCountSubject = new BehaviorSubject<number>(0);

  unreadCount$ = this.unreadCountSubject.asObservable();

  get unreadCount(): number {
    return this.unreadCountSubject.value;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Get notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/notifications?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Get unread count from API
  getUnreadCount(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/notifications/unread-count`,
      { headers: this.getHeaders() }
    );
  }

  // Refresh shared unread count
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        const data = response?.data;

        const count =
          typeof data === 'number'
            ? data
            : data?.unreadCount ??
              data?.count ??
              response?.unreadCount ??
              response?.count ??
              0;

        this.setUnreadCount(Number(count) || 0);
      },
      error: (error) => {
        console.error('Unread Count Error:', error);
      },
    });
  }

  // Update shared count
  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(0, count));
  }

  // Mark one notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/notifications/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
