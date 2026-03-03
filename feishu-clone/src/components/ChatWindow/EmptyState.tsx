import React from 'react';
import './ChatWindow.css';

const EmptyState: React.FC = () => {
    return (
        <div className="empty-state">
            <div className="empty-state-emoji">🤩</div>
            <p className="empty-state-text">每一个想法都闪闪发光</p>
        </div>
    );
};

export default EmptyState;
