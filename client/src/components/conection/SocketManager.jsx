import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAtom, atom } from 'jotai';

// Conexión al servidor Socket.io
export const socket = io('http://localhost:3001');


// Atoms de Jotai para el estado global
export const characterAtom = atom([]);
export const myIdAtom = atom(null);

// Componente SocketManager, uso de atoms
export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(characterAtom);
  const [_myId, setMyId] = useAtom(myIdAtom);

 // --- Manejadores de eventos del socket ---
  useEffect(() => {

    const onConnect = () => console.log("Conectado al servidor");
    const onDisconnect = () => console.log("Desconectado del servidor");

    const onWelcome = (data) => {
      console.log("Servidor dice hello, id:",data.id); 
      setMyId(data.id);}
    
    const onCharacters = (value) => {
      setCharacters(value);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("welcome", onWelcome);
    socket.on("characters", onCharacters);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("welcome", onWelcome);
      socket.off("characters", onCharacters);
    };
  }, []);
  return null; 
};
