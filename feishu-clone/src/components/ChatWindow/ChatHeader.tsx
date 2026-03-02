import React from 'react';
import './ChatWindow.css';
import Avatar from '../common/Avatar';
import type { Conversation, User } from '../../types';
import { Search, Monitor, Phone, Video, Users, Calendar, MoreHorizontal, Plus } from 'lucide-react';

interface ChatHeaderProps {
    conversation: Conversation;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
    const isDm = conversation.type === 'dm';
    const dmUser: User | undefined = isDm ? conversation.members?.[0] : undefined;

    // For groupIcon we use a silhouette if none provided
    const hasGroupAvatar = conversation.type === 'group';

    return (
        <div className="chat-header">
            <div className="chat-header-main">
                <div className="chat-header-left">
                    {isDm && dmUser ? (
                        <Avatar user={dmUser} size={36} />
                    ) : (
                        <Avatar groupIcon={hasGroupAvatar} size={36} />
                    )}

                    <div className="chat-header-info">
                        <div className="chat-header-top-row">
                            <span className="chat-header-name">{conversation.name}</span>
                            {conversation.type === 'group' && conversation.memberCount && (
                                <div className="chat-header-members">
                                    <Users size={12} />
                                    <span>{conversation.memberCount}</span>
                                </div>
                            )}
                            {isDm && dmUser && (
                                <>
                                    <span className="chat-header-sep">|</span>
                                    <span className="chat-header-bio">
                                        {dmUser.org || '蜀汉集团'} {dmUser.title ? `| ${dmUser.title}` : ''} {dmUser.email ? `| ${dmUser.email}` : ''}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="chat-header-bottom-row">
                            <div className="chat-header-tabs">
                                <button className="chat-header-tab active">聊天</button>
                                <button className="chat-header-tab">文档</button>
                                <button className="chat-header-tab">文件</button>
                                <button className="chat-header-tab-add">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-header-actions">
                    <button className="chat-header-action"><Search size={18} /></button>
                    <button className="chat-header-action"><Monitor size={18} /></button>
                    <button className="chat-header-action"><Phone size={18} /></button>
                    <button className="chat-header-action"><Video size={18} /></button>
                    <button className="chat-header-action"><Users size={18} /></button>
                    <button className="chat-header-action"><Calendar size={18} /></button>
                    <button className="chat-header-action"><MoreHorizontal size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
