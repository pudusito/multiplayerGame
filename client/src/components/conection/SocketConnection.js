import { io } from 'socket.io-client';
import { atom } from 'jotai';

export const Socket = io('http://localhost:3001'); // instancia única
export const characterAtom = atom([]);
export const myIdAtom = atom(null);