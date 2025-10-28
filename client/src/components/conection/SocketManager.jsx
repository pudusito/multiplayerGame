import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAtom, atom } from 'jotai';

export const socket = io('http://localhost:3001');
export const characterAtom = atom([]);

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(characterAtom);

  useEffect(() => {
    const onConnect = () => console.log("Conectado al servidor");
    const onDisconnect = () => console.log("Desconectado del servidor");
    const onWelcome = () => console.log("Servidor dice hello");
    const onCharacters = (value) => {setCharacters(value);};

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
};
