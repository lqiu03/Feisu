import React, { useState } from 'react';
import './FilterPanel.css';
import type { FilterCategory } from '../../types.ts';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
    activeFilter: FilterCategory;
    onFilterChange: (filter: FilterCategory) => void;
}

/* Small inline SVG icons matching Feishu reference */
const ChatIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const MailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const FlagIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
const AtIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0V12a9 9 0 1 0-5.5 8.28" /></svg>;
const UserIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const UsersIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const FileIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const ThreadIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="10" x2="15" y2="10" /></svg>;
const CheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const FilterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>;
const GearIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

const filterItems: { key: FilterCategory; icon: React.ReactNode; label: string; count?: number }[] = [
    { key: 'chats', icon: <ChatIcon />, label: '聊天', count: 213 },
    { key: 'unread', icon: <MailIcon />, label: '未读', count: 213 },
    { key: 'flagged', icon: <FlagIcon />, label: '标记' },
    { key: 'mentions', icon: <AtIcon />, label: '@我', count: 6 },
];

const labelItems: { key: FilterCategory; icon: React.ReactNode; label: string; count?: number }[] = [
    { key: 'dms', icon: <UserIcon />, label: '私聊', count: 1 },
    { key: 'groups', icon: <UsersIcon />, label: '群组', count: 37 },
    { key: 'docs', icon: <FileIcon />, label: '文档', count: 2 },
    { key: 'threads', icon: <ThreadIcon />, label: '话题' },
    { key: 'done', icon: <CheckIcon />, label: '已完成' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ activeFilter, onFilterChange }) => {
    const [labelsOpen, setLabelsOpen] = useState(true);

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <div className="filter-header-left">
                    <FilterIcon />
                    <span>筛选</span>
                </div>
                <button className="filter-gear-btn"><GearIcon /></button>
            </div>

            <div className="filter-list">
                {filterItems.map((item) => (
                    <div
                        key={item.key}
                        className={`filter-item ${activeFilter === item.key ? 'active' : ''}`}
                        onClick={() => onFilterChange(item.key)}
                    >
                        <span className="filter-item-icon">{item.icon}</span>
                        <span className="filter-item-label">{item.label}</span>
                        {item.count !== undefined && (
                            <span className={`filter-item-count ${activeFilter === item.key ? 'active' : ''}`}>
                                {item.count}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="filter-label-section">
                <div className="filter-label-header" onClick={() => setLabelsOpen(!labelsOpen)}>
                    <ChevronDown size={12} style={{ transform: labelsOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
                    <span>标签</span>
                </div>
                {labelsOpen && (
                    <div className="filter-list">
                        {labelItems.map((item) => (
                            <div
                                key={item.key}
                                className={`filter-item ${activeFilter === item.key ? 'active' : ''}`}
                                onClick={() => onFilterChange(item.key)}
                            >
                                <span className="filter-item-icon">{item.icon}</span>
                                <span className="filter-item-label">{item.label}</span>
                                {item.count !== undefined && (
                                    <span className={`filter-item-count ${activeFilter === item.key ? 'active' : ''}`}>
                                        {item.count}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
