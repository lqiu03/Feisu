import React from 'react';
import './UserProfilePopover.css';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { currentUser } from '../../data/mockData';
import { ExternalLink } from 'lucide-react';

interface UserProfilePopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="popover-overlay" onClick={onClose} />
            <div className="user-profile-popover">
                <div className="popover-header">
                    <Avatar user={currentUser} size={56} />
                    <div className="popover-name-section">
                        <span className="popover-name">{currentUser.name}</span>
                        <div className="popover-org">
                            <span className="popover-org-text">{currentUser.org}</span>
                            {currentUser.isVerified && (
                                <span className="popover-verified">✅ Verified</span>
                            )}
                        </div>
                    </div>
                </div>

                <button className="popover-status-btn">+ 状态</button>

                <div className="popover-bio">
                    <input
                        type="text"
                        className="popover-bio-input"
                        placeholder="说点什么介绍自己..."
                        readOnly
                    />
                </div>

                <div className="popover-menu">
                    <div className="popover-menu-item">个人资料</div>
                    <div className="popover-menu-item">二维码和名片链接</div>
                    <div className="popover-menu-item">
                        登录更多账号
                        <Badge dot />
                    </div>

                    <div className="popover-divider" />

                    <div className="popover-menu-item">
                        联系我们
                        <ExternalLink size={14} className="popover-menu-icon" />
                    </div>
                    <div className="popover-menu-item">
                        设置
                        <Badge dot />
                    </div>

                    <div className="popover-divider" />

                    <div className="popover-menu-item">退出登录</div>
                </div>
            </div>
        </>
    );
};

export default UserProfilePopover;
