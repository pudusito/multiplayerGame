import { io } from 'socket.io-client';
import { atom } from 'jotai';

export const Socket = io('http://localhost:3001', {autoConnect: false }); // instancia única
export const characterAtom = atom([]);
export const myIdAtom = atom(null);
export const mapAtom = atom(null);