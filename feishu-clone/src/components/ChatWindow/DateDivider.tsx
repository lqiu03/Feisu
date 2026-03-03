import React from 'react';
import './ChatWindow.css';

interface DateDividerProps {
    date: string;
}

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
    return (
        <div className="date-divider">
            <span className="date-divider-text">{date}</span>
        </div>
    );
};

export default DateDivider;
