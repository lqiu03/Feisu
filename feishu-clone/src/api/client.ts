import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(BACKEND_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        });
    }
    return socket;
}

export async function fetchConversations(userId: string = 'u-liubei') {
    const res = await fetch(`${BACKEND_URL}/api/conversations?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
}

export async function fetchMessages(conversationId: string) {
    const res = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${BACKEND_URL}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function fetchConversationMembers(conversationId: string) {
    const res = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/members`);
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
}
