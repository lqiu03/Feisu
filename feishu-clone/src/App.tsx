import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import Sidebar from './components/Sidebar/Sidebar';
import FilterPanel from './components/FilterPanel/FilterPanel';
import ChatList from './components/ChatList/ChatList';
import ChatHeader from './components/ChatWindow/ChatHeader';
import MessageThread from './components/ChatWindow/MessageThread';
import MessageInput from './components/ChatWindow/MessageInput';
import EmptyState from './components/ChatWindow/EmptyState';
import UserProfilePopover from './components/UserProfilePopover/UserProfilePopover';
import { getSocket, fetchConversations, fetchMessages } from './api/client';
import type { FilterCategory, Conversation, Message } from './types.ts';
import { Clock, Minus, Square, X } from 'lucide-react';

const CURRENT_USER_ID = 'u-liubei';

function App() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const socketRef = useRef(getSocket());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load conversations from API
  useEffect(() => {
    fetchConversations(CURRENT_USER_ID).then((data) => {
      const mapped: Conversation[] = data.map((c: any) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        memberCount: c.member_count,
        lastMessage: c.last_message ? {
          sender: c.last_message.sender_name || '',
          text: c.last_message.text || '',
          timestamp: c.last_message.created_at || '',
        } : { sender: '', text: '暂无消息', timestamp: c.created_at },
        unreadCount: c.unread_count || 0,
        isMuted: c.is_muted,
        isPinned: false,
        departmentTag: c.department_tag,
        members: c.members ? c.members.map((m: any) => ({
          id: m.id,
          name: m.display_name,
          initials: m.initials,
          initialsColor: m.initials_color,
          email: m.email,
          org: m.org,
          title: m.title
        })) : []
      }));
      setConversations(mapped);
      if (mapped.length > 0 && !activeConversationId) {
        setActiveConversationId(mapped[0].id);
      }
    }).catch(console.error);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages(activeConversationId).then((data) => {
      const mapped: Message[] = data.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        sender: {
          id: m.sender_id,
          name: m.sender_name || '未知',
          initials: m.initials || '?',
          initialsColor: m.initials_color || '#8B909A',
        },
        text: m.text,
        timestamp: m.created_at,
        isMe: m.sender_id === CURRENT_USER_ID,
        isRead: true,
        isEdited: m.is_edited,
      }));
      setMessages(mapped);
    }).catch(console.error);
    socketRef.current.emit('conversation.join', activeConversationId);
  }, [activeConversationId]);

  // WebSocket listeners
  useEffect(() => {
    const socket = socketRef.current;
    socket.emit('auth', CURRENT_USER_ID);

    socket.on('message.created', (msg: any) => {
      const newMessage: Message = {
        id: msg.id,
        conversationId: msg.conversation_id,
        sender: {
          id: msg.sender_id,
          name: msg.sender_name,
          initials: msg.initials || '?',
          initialsColor: msg.initials_color || '#8B909A',
        },
        text: msg.text,
        timestamp: msg.created_at,
        isMe: msg.sender_id === CURRENT_USER_ID,
        isRead: false,
        isEdited: false,
      };
      if (msg.conversation_id === activeConversationId) {
        setMessages(prev => [...prev, newMessage]);
      }
      setConversations(prev => prev.map(c =>
        c.id === msg.conversation_id
          ? {
            ...c,
            lastMessage: { sender: msg.sender_name, text: msg.text, timestamp: msg.created_at },
            unreadCount: msg.sender_id !== CURRENT_USER_ID ? c.unreadCount + 1 : c.unreadCount,
          }
          : c
      ));
    });

    socket.on('typing.indicator', ({ conversationId, userId, isTyping }: any) => {
      setTypingUsers(prev => {
        const current = prev[conversationId] || [];
        if (isTyping && !current.includes(userId)) {
          return { ...prev, [conversationId]: [...current, userId] };
        } else if (!isTyping) {
          return { ...prev, [conversationId]: current.filter((u: string) => u !== userId) };
        }
        return prev;
      });
    });

    return () => {
      socket.off('message.created');
      socket.off('typing.indicator');
    };
  }, [activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const filteredConversations = activeFilter === 'groups'
    ? conversations.filter(c => c.type === 'group')
    : activeFilter === 'dms'
      ? conversations.filter(c => c.type === 'dm')
      : activeFilter === 'unread'
        ? conversations.filter(c => c.unreadCount > 0)
        : conversations;

  const filterTitles: Record<FilterCategory, string> = {
    chats: '聊天', unread: '未读', flagged: '标记', mentions: '@我',
    dms: '私聊', groups: '群组', docs: '文档', threads: '话题', done: '已完成',
  };

  const handleSendMessage = useCallback((text: string) => {
    if (!activeConversationId) return;
    socketRef.current.emit('message.send', { conversationId: activeConversationId, text });
    socketRef.current.emit('typing.stop', { conversationId: activeConversationId });
  }, [activeConversationId]);

  const handleTyping = useCallback(() => {
    if (!activeConversationId) return;
    socketRef.current.emit('typing.start', { conversationId: activeConversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing.stop', { conversationId: activeConversationId });
    }, 2000);
  }, [activeConversationId]);

  const typingString = activeConversationId && typingUsers[activeConversationId]?.length
    ? `${typingUsers[activeConversationId].join(', ')} 正在输入...`
    : null;

  const handleOpenUserDm = useCallback((userId: string) => {
    // Basic mapping: u-guanyu -> c-guanyu-dm
    const username = userId.split('-')[1];
    const convId = userId === CURRENT_USER_ID ? 'c-liubei-dm' : `c-${username}-dm`;

    // We also want to ensure the 'dms' filter is active or 'chats' (which shows everything)
    // To be sure the chat list shows the item as active, 'chats' or 'dms' works.
    setActiveFilter('chats');
    setActiveConversationId(convId);
  }, []);

  return (
    <div className="app-viewport">
      {/* macOS-style title bar */}
      <div className="app-titlebar">
        <button className="titlebar-btn"><Clock size={16} /></button>
        <button className="titlebar-btn"><Minus size={16} /></button>
        <button className="titlebar-btn"><Square size={14} /></button>
        <button className="titlebar-btn"><X size={16} /></button>
      </div>

      <div className="app-container">
        <Sidebar onAvatarClick={() => setShowProfile(true)} />

        <div className="middle-column">
          <FilterPanel activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <ChatList
            conversations={filteredConversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onUserSelect={handleOpenUserDm}
            title={filterTitles[activeFilter]}
          />
        </div>

        <div className="chat-window">
          {activeConversation ? (
            <>
              <ChatHeader conversation={activeConversation} />
              {typingString && <div className="typing-indicator">{typingString}</div>}
              <MessageThread messages={messages} />
              <MessageInput
                placeholder={`给 ${activeConversation.name} 发消息`}
                onSend={handleSendMessage}
                onTyping={handleTyping}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <UserProfilePopover
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      </div>
    </div>
  );
}

export default App;
