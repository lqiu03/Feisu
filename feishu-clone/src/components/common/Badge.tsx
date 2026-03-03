import React from 'react';
import './common.css';

interface BadgeProps {
    count?: number;
    dot?: boolean;
    label?: string;
    variant?: 'danger' | 'bot' | 'department';
}

const Badge: React.FC<BadgeProps> = ({ count, dot, label, variant = 'danger' }) => {
    if (dot) {
        return <span className="badge-dot" />;
    }

    if (label) {
        return (
            <span className={`badge-label badge-label-${variant}`}>
                {label}
            </span>
        );
    }

    if (count && count > 0) {
        return (
            <span className="badge-count">
                {count > 999 ? '999+' : count}
            </span>
        );
    }

    return null;
};

export default Badge;
