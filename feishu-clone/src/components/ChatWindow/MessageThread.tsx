import React, { useEffect, useRef } from 'react';
import './ChatWindow.css';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import type { Message } from '../../types.ts';

interface MessageThreadProps {
    messages: Message[];
}

function getDateLabel(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    let lastDate = '';
    let lastSenderId = '';

    return (
        <div className="message-thread">
            {messages.map((msg) => {
                const dateLabel = getDateLabel(msg.timestamp);
                const showDate = dateLabel !== lastDate;
                // Show sender name & avatar only if different sender or new date
                const showSender = msg.sender.id !== lastSenderId || showDate;

                lastDate = dateLabel;
                lastSenderId = msg.sender.id;

                return (
                    <React.Fragment key={msg.id}>
                        {showDate && <DateDivider date={dateLabel} />}
                        <MessageBubble message={msg} showSender={showSender} />
                    </React.Fragment>
                );
            })}
            <div ref={endRef} />
        </div>
    );
};

export default MessageThread;
