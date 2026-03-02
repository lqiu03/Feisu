import React from 'react';
import './ChatList.css';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { pinnedContacts } from '../../data/mockData';
import type { Conversation } from '../../types.ts';

interface ChatListProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onUserSelect?: (userId: string) => void;
    title: string;
}

function formatTimestamp(iso: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[date.getDay()];
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

const PinnedContacts: React.FC<{ onUserSelect?: (id: string) => void }> = ({ onUserSelect }) => (
    <div className="pinned-contacts">
        {pinnedContacts.map((user) => (
            <div key={user.id} className="pinned-contact" onClick={() => onUserSelect?.(user.id)}>
                <Avatar user={user} size={48} />
                <span className="pinned-contact-name">{user.name}</span>
            </div>
        ))}
    </div>
);

interface ChatListItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, isActive, onClick }) => {
    const isGroup = conversation.type === 'group';
    const isBot = conversation.type === 'bot';
    const isMeeting = conversation.type === 'meeting';
    const isDm = conversation.type === 'dm';
    const dmUser = isDm ? conversation.members?.[0] : undefined;

    return (
        <div className={`chat-list-item ${isActive ? 'active' : ''}`} onClick={onClick}>
            <div className="chat-list-item-avatar">
                {isDm && dmUser ? (
                    <Avatar user={dmUser} size={40} />
                ) : isMeeting ? (
                    <Avatar size={40} meetingIcon />
                ) : isGroup ? (
                    <Avatar size={40} groupIcon />
                ) : isBot ? (
                    <Avatar user={{ id: '', name: conversation.name, initials: conversation.name[0], initialsColor: '#34C759' }} size={40} />
                ) : (
                    <Avatar size={40} groupIcon />
                )}
                {conversation.unreadCount > 0 && (
                    <span className="chat-list-item-badge">
                        <Badge count={conversation.unreadCount} />
                    </span>
                )}
            </div>

            <div className="chat-list-item-content">
                <div className="chat-list-item-top">
                    <span className="chat-list-item-name">
                        {conversation.name}
                        {isBot && <Badge label="BOT" variant="bot" />}
                        {conversation.departmentTag && <Badge label={conversation.departmentTag} variant="department" />}
                    </span>
                    <span className="chat-list-item-time">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                    </span>
                </div>
                <div className="chat-list-item-bottom">
                    <span className="chat-list-item-preview">
                        {conversation.lastMessage.sender && conversation.lastMessage.sender !== conversation.name && (
                            <span className="chat-list-item-preview-sender">{conversation.lastMessage.sender}: </span>
                        )}
                        {conversation.lastMessage.text}
                    </span>
                    {conversation.isMuted && (
                        <span className="chat-list-item-muted">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatList: React.FC<ChatListProps> = ({ conversations, activeId, onSelect, onUserSelect, title }) => {
    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <h2 className="chat-list-title">{title}</h2>
            </div>
            <PinnedContacts onUserSelect={onUserSelect} />
            <div className="chat-list-items">
                {conversations.map((conv) => (
                    <ChatListItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeId}
                        onClick={() => onSelect(conv.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChatList;
