export type NotificationActor = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: {
    public_id: string;
    url: string;
  };
};

export type NotificationType =
  | "like"
  | "comment"
  | "friend_request"
  | "friend_accept"
  | "post"
  | "story"
  | "share"
  | "group"
  | "event"
  | "follow"
  | "message";

export type Notification = {
  _id: string;
  user: string;
  actor: NotificationActor;
  type: NotificationType;
  referenceId: string;
  title: string;
  body: string;
  deepLink: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationMeta = {
  unreadCount: number;
};

export type NotificationPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type NotificationsResponse = {
  success: boolean;
  message: string;
  data: Notification[];
  meta: NotificationMeta;
  pagination: NotificationPagination;
};

export type MarkReadResponse = {
  success: boolean;
  message: string;
  data: Notification;
};

export type DeleteNotificationResponse = {
  success: boolean;
  message: string;
  data: { notificationId: string };
};

export type MarkAllReadResponse = {
  success: boolean;
  message: string;
  data: null;
};
