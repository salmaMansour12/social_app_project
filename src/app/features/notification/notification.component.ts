
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NotificationService } from '../../notification-services.service';

interface AppNotification {
  _id?: string;
  isRead?: boolean;
  read?: boolean;
  type?: string;
  message?: string;
  content?: string;
  text?: string;
  body?: string;
  actorName?: string;
  createdAt?: string;
  date?: string;
  actor?: Record<string, unknown>;
  sender?: Record<string, unknown>;
  user?: Record<string, unknown>;
  from?: Record<string, unknown>;
  entity?: { user?: Record<string, unknown> };
}

interface NotificationsResponse {
  data?:
    | AppNotification[]
    | {
        notifications?: AppNotification[];
        results?: AppNotification[];
        items?: AppNotification[];
      };
  unreadCount?: number;
  count?: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications: AppNotification[] = [];

  get unreadCount(): number {
  return this.notificationService.unreadCount;
}

  activeTab: 'all' | 'unread' = 'all';

  isLoading = false;
  isMarkingAll = false;

  loadingNotificationId: string | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  // ================= GET NOTIFICATIONS =================

  loadNotifications(): void {
    this.isLoading = true;

    this.notificationService.getNotifications(1, 20).subscribe({
      next: (response: NotificationsResponse) => {
        const data = response?.data;

        const list = Array.isArray(data)
          ? data
          : data?.notifications ?? data?.results ?? data?.items ?? [];

        this.notifications = list;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Notifications Error:', error);

        this.isLoading = false;

        this.showToast('Failed to load notifications', 'error');
      },
    });
  }

  // ================= UNREAD COUNT =================
loadUnreadCount(): void {
  this.notificationService.refreshUnreadCount();
}

  // ================= FILTER NOTIFICATIONS =================

  get visibleNotifications(): AppNotification[] {
    if (this.activeTab === 'unread') {
      return this.notifications.filter((notification) =>
        this.isUnread(notification)
      );
    }

    return this.notifications;
  }

  setActiveTab(tab: 'all' | 'unread'): void {
    this.activeTab = tab;
  }

  // ================= CHECK READ STATUS =================

  isUnread(notification: AppNotification): boolean {
    return !(notification.isRead ?? notification.read ?? false);
  }

  // ================= ACTOR INFORMATION =================

  getActor(notification: AppNotification): any {
    return (
      notification.actor ||
      notification.sender ||
      notification.user ||
      notification.from ||
      notification.entity?.user ||
      {}
    );
  }

  getActorName(notification: AppNotification): string {
    const actor = this.getActor(notification);

    return (
      actor?.name ||
      actor?.username ||
      notification.actorName ||
      'Someone'
    );
  }

  getActorPhoto(notification: AppNotification): string {
    const actor = this.getActor(notification);

    return (
      actor?.photo ||
      actor?.avatar ||
      'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff'
    );
  }

  // ================= NOTIFICATION MESSAGE =================

  getNotificationMessage(notification: AppNotification): string {
    if (
      notification.message ||
      notification.content ||
      notification.text ||
      notification.body
    ) {
      return (
        notification.message ||
        notification.content ||
        notification.text ||
        notification.body ||
        ''
      );
    }

    const type = (notification.type || '').toLowerCase();

    if (type.includes('like')) {
      return 'liked your post';
    }

    if (type.includes('comment')) {
      return 'commented on your post';
    }

    if (type.includes('follow')) {
      return 'started following you';
    }

    if (type.includes('share')) {
      return 'shared your post';
    }

    return 'sent you a notification';
  }

  // ================= NOTIFICATION ICON =================

  getNotificationIcon(notification: AppNotification): string {
    const type = (notification.type || '').toLowerCase();

    if (type.includes('like')) return '❤️';

    if (type.includes('comment')) return '💬';

    if (type.includes('follow')) return '👤';

    if (type.includes('share')) return '🔁';

    return '🔔';
  }

  // ================= MARK ONE AS READ =================

  markAsRead(notification: AppNotification): void {
    if (!this.isUnread(notification) || !notification._id) {
      return;
    }

    this.loadingNotificationId = notification._id;

    this.notificationService.markAsRead(notification._id).subscribe({
    next: () => {
  notification.isRead = true;
  notification.read = true;

  this.loadingNotificationId = null;

  this.notificationService.setUnreadCount(
    this.unreadCount - 1
  );

  this.showToast('Notification marked as read');
},

      error: (error) => {
        console.error('Mark Notification Error:', error);

        this.loadingNotificationId = null;

        this.showToast('Could not mark notification as read', 'error');
      },
    });
  }

  // ================= MARK ALL AS READ =================


markAllAsRead(): void {
  if (this.unreadCount === 0 || this.isMarkingAll) {
    return;
  }

  this.isMarkingAll = true;

  this.notificationService.markAllAsRead().subscribe({

    next: () => {

      // Update all notifications locally
      this.notifications = this.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        read: true,
      }));

      // Reset unread count
      this.notificationService.setUnreadCount(0);

      // Refresh count from API
      this.notificationService.refreshUnreadCount();

      this.isMarkingAll = false;

      this.showToast('All notifications marked as read');

    },

    error: (error) => {

      console.error('Mark All Error:', error);

      this.isMarkingAll = false;

      this.showToast('Could not update notifications', 'error');

    },

  });
}


  // ================= FORMAT DATE =================

  getTime(date?: string): string {
    if (!date) return '';

    const notificationDate = new Date(date);

    if (isNaN(notificationDate.getTime())) {
      return '';
    }

    const now = new Date();

    const diff = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000
    );

    if (diff < 60) {
      return 'Just now';
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    }

    if (diff < 604800) {
      return `${Math.floor(diff / 86400)}d ago`;
    }

    return notificationDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // ================= TOAST =================

  showToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
