import { io } from 'socket.io-client';
import { atom } from 'jotai';

console.log('[socketAtoms] módulo cargado — creando/obteniendo socket');

export const Socket = io('http://localhost:3001'); // instancia única
export const characterAtom = atom([]);
export const myIdAtom = atom(null);