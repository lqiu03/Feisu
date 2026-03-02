import React from 'react';
import './common.css';
import type { User } from '../../types.ts';

interface AvatarProps {
    user?: User;
    size?: number;
    groupIcon?: boolean;
    meetingIcon?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    user,
    size = 40,
    groupIcon = false,
    meetingIcon = false,
}) => {
    if (groupIcon) {
        return (
            <div
                className="avatar avatar-group"
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
            </div>
        );
    }

    if (meetingIcon) {
        return (
            <div
                className="avatar avatar-meeting"
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
            </div>
        );
    }

    if (user?.avatar) {
        return (
            <img
                className="avatar"
                src={user.avatar}
                alt={user.name}
                style={{ width: size, height: size }}
            />
        );
    }

    // Initials avatar — support multi-char (e.g. "诸葛", "QM")
    const initials = user?.initials || '?';
    const fontSize = initials.length > 1 ? size * 0.32 : size * 0.42;

    return (
        <div
            className="avatar avatar-initials"
            style={{
                width: size,
                height: size,
                backgroundColor: user?.initialsColor || '#8B909A',
                fontSize,
            }}
        >
            {initials}
        </div>
    );
};

export default Avatar;
