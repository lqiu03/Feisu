import React from 'react';
import './Sidebar.css';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { currentUser } from '../../data/mockData';
import { Plus } from 'lucide-react';

interface SidebarProps {
    onAvatarClick?: () => void;
}

/* Filled SVG icons matching Feishu exactly */
const MessageFilledIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
);
const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const DocsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
);
const BaseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
const MeetingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
);
const WikiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
);
const WorkplaceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const UTalkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const MoreIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
);
const ApprovalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#FF6A00" /><path d="M10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" fill="#FFFFFF" /></svg>
);
const SearchIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const Sidebar: React.FC<SidebarProps> = ({ onAvatarClick }) => {
    const navItems = [
        { icon: <MessageFilledIcon />, label: '消息', badge: 213, active: true },
        { icon: <CalendarIcon />, label: '日历' },
        { icon: <DocsIcon />, label: '文档' },
        { icon: <BaseIcon />, label: '多维表格' },
        { icon: <MeetingsIcon />, label: '会议' },
        { icon: <WikiIcon />, label: '知识库' },
        { icon: <WorkplaceIcon />, label: '工作台' },
        { icon: <UTalkIcon />, label: '同事圈', dot: true },
        { icon: <MoreIcon />, label: '更多' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-avatar-wrap" onClick={onAvatarClick}>
                    <Avatar user={currentUser} size={28} />
                </div>
                <button className="sidebar-create-btn">
                    <Plus size={14} strokeWidth={2.5} />
                </button>
            </div>

            <button className="sidebar-search">
                <SearchIcon />
                <span>搜索(Ctrl+K)</span>
            </button>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div
                        key={item.label}
                        className={`sidebar-nav-item ${item.active ? 'active' : ''}`}
                    >
                        {item.active && <div className="sidebar-active-indicator" />}
                        <div className="sidebar-nav-icon">
                            {item.icon}
                            {item.badge !== undefined && (
                                <span className="sidebar-nav-badge"><Badge count={item.badge} /></span>
                            )}
                            {item.dot && (
                                <span className="sidebar-nav-dot"><Badge dot /></span>
                            )}
                        </div>
                        <span className="sidebar-nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-nav-item">
                    <div className="sidebar-nav-icon">
                        <ApprovalIcon />
                    </div>
                    <span className="sidebar-nav-label">审批</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
