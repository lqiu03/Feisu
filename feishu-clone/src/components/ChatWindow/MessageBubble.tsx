import React from 'react';
import './ChatWindow.css';
import Avatar from '../common/Avatar';
import type { Message } from '../../types.ts';

interface MessageBubbleProps {
    message: Message;
    showSender?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showSender = true }) => {
    const { sender, text, isMe, isRead, isEdited, reactions } = message;

    return (
        <div className={`message-row ${isMe ? 'mine' : 'theirs'}`}>
            {/* Theirs: Avatar on the LEFT */}
            {!isMe && (
                <div className="message-avatar-wrap">
                    {showSender ? (
                        <Avatar user={sender} size={36} />
                    ) : (
                        <div className="avatar-placeholder" />
                    )}
                </div>
            )}

            <div className="message-body">
                {!isMe && showSender && (
                    <div className="message-sender-name">{sender.name}</div>
                )}

                <div className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    <span className="message-text">
                        {text}
                        {isEdited && <span className="message-edited">(已编辑)</span>}
                    </span>
                </div>

                {reactions && reactions.length > 0 && (
                    <div className="message-reactions">
                        {reactions.map((r, i) => (
                            <span key={i} className="message-reaction">
                                <span className="reaction-emoji">{r.emoji}</span>
                                <span className="reaction-user-count">{r.users.length}</span>
                            </span>
                        ))}
                    </div>
                )}

                {isMe && (
                    <div className="message-status">
                        {isRead ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#34C759">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        ) : (
                            <div className="sending-dot" />
                        )}
                    </div>
                )}
            </div>

            {/* Mine: Avatar on the RIGHT */}
            {isMe && (
                <div className="message-avatar-wrap">
                    {showSender ? (
                        <Avatar user={sender} size={36} />
                    ) : (
                        <div className="avatar-placeholder" />
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
