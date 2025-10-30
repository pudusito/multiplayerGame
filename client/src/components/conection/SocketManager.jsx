// ...existing code...
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Socket, characterAtom, myIdAtom } from "./SocketConnection.js";

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(characterAtom);
  const [_myId, setMyId] = useAtom(myIdAtom);

  useEffect(() => {

    const onConnect = () => {
      console.log('[Socket] connect', Socket.id);
      if (Socket.id) setMyId(Socket.id);
    };
    const onDisconnect = (reason) => console.log('[Socket] disconnect', reason);

    
    const onWelcome = (data) => {
      console.log('[Socket] welcome', data);
      setMyId(data.id);
    };
    const onCharacters = (value) => {
      setCharacters(value);
      // Inferir myId si no está fijado y el socket.id coincide con algún character
      if (!_myId && Socket.id) {
        const found = value.find((c) => String(c.id) === String(Socket.id));
        if (found) {
          console.log('[SocketManager] inferred myId from characters:', found.id);
          setMyId(found.id);
        }
      }
    };

    Socket.on('connect', onConnect);
    Socket.on('disconnect', onDisconnect);
    Socket.on('welcome', onWelcome);
    Socket.on('characters', onCharacters);

    // Si ya está conectado al montar, fijar el id inmediatamente
    if (Socket.connected && Socket.id) {
      setMyId(Socket.id);
    }

    return () => {
      Socket.off('connect', onConnect);
      Socket.off('disconnect', onDisconnect);
      Socket.off('welcome', onWelcome);
      Socket.off('characters', onCharacters);
    };
  }, [setCharacters, setMyId, _myId]);

  return null;
};
