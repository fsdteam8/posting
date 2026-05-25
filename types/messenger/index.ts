export type MessengerUser = {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  profileImage?: {
    public_id?: string;
    url?: string;
  };
  isOnline?: boolean;
};

export type LastMessage = {
  text?: string;
  sender?:
    | string
    | { _id: string; firstName?: string; lastName?: string };
  at?: string | null;
  type?: string;
};

export type ConversationAvatar = {
  url?: string;
  public_id?: string;
};

export type Conversation = {
  _id: string;
  participants: MessengerUser[];
  isGroup: boolean;
  name?: string;
  avatar?: ConversationAvatar;
  admins?: string[];
  lastMessage?: LastMessage;
  mutedBy?: string[];
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Reaction = {
  user: string;
  emoji: string;
};

export type MessageMedia = {
  url?: string;
  public_id?: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
};

export type MessageType = "text" | "image" | "video" | "audio" | "file";

export type MessageSendStatus = "waiting" | "sent" | "delivered" | "failed";

export type Message = {
  _id: string;
  conversation: string;
  sender: MessengerUser;
  type: MessageType;
  text?: string;
  media?: MessageMedia;
  replyTo?: Message | null;
  seenBy?: string[];
  reactions?: Reaction[];
  deletedFor?: string[];
  isDeleted?: boolean;
  isEdited?: boolean;
  isPinned?: boolean;
  sendStatus?: MessageSendStatus;
  createdAt: string;
  updatedAt?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ConversationsResponse = {
  success: boolean;
  message: string;
  data: Conversation[];
  pagination: Pagination;
};

export type MessagesResponse = {
  success: boolean;
  message: string;
  data: Message[];
  pagination: Pagination;
};

export type SendMessageResponse = {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    message: Message;
  };
};

export type FriendUser = MessengerUser;

export type FriendsResponse = {
  success: boolean;
  message: string;
  data: FriendUser[];
  pagination?: Pagination;
};
