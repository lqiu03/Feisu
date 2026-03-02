export interface User {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    initialsColor: string;
    email?: string;
    org?: string;
    title?: string;
    isVerified?: boolean;
    isBot?: boolean;
}

export interface Conversation {
    id: string;
    type: 'group' | 'dm' | 'bot' | 'meeting';
    name: string;
    memberCount?: number;
    lastMessage: {
        sender: string;
        text: string;
        timestamp: string;
    };
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    departmentTag?: string;
    members?: User[];
}

export interface Message {
    id: string;
    conversationId: string;
    sender: User;
    text: string;
    timestamp: string;
    isMe: boolean;
    isRead: boolean;
    isEdited: boolean;
    reactions?: { emoji: string; users: User[] }[];
    replyTo?: Message;
}

export type FilterCategory =
    | 'chats'
    | 'unread'
    | 'flagged'
    | 'mentions'
    | 'dms'
    | 'groups'
    | 'docs'
    | 'threads'
    | 'done';
