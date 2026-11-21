
export interface NotificationUser {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
  avatar?: string;
}

export interface AppNotification {
  _id: string;

  type?: string;
  message?: string;
  content?: string;
  text?: string;
  body?: string;

  isRead?: boolean;
  read?: boolean;

  createdAt?: string;

  actor?: NotificationUser;
  sender?: NotificationUser;
  user?: NotificationUser;
  from?: NotificationUser;

  actorName?: string;

  entity?: {
    user?: NotificationUser;
  };

  post?: {
    _id?: string;
    body?: string;
    image?: string;
  };
}

export interface NotificationsResponse {
  success?: boolean;
  message?: string;
  data?: {
    notifications?: AppNotification[];
    results?: AppNotification[];
    items?: AppNotification[];
    unreadCount?: number;
    count?: number;
  };
}
