import React, { useState } from 'react';
import './ChatWindow.css';
import {
    Type, Smile, AtSign, Scissors, PlusCircle, Maximize2, Send
} from 'lucide-react';

interface MessageInputProps {
    placeholder: string;
    onSend?: (text: string) => void;
    onTyping?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ placeholder, onSend, onTyping }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && onSend) {
            onSend(text.trim());
            setText('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (e.target.value.length > 0 && onTyping) {
            onTyping();
        }
    };

    return (
        <div className="message-input">
            <input
                className="message-input-field"
                type="text"
                placeholder={placeholder}
                value={text}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                }}
            />
            <div className="message-input-toolbar">
                <button className="message-input-btn"><Type size={18} /></button>
                <button className="message-input-btn"><Smile size={18} /></button>
                <button className="message-input-btn"><AtSign size={18} /></button>
                <button className="message-input-btn"><Scissors size={18} /></button>
                <button className="message-input-btn"><PlusCircle size={18} /></button>
                <button className="message-input-btn"><Maximize2 size={18} /></button>
                <button
                    className={`message-input-send ${text.trim() ? 'active' : ''}`}
                    onClick={handleSend}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
