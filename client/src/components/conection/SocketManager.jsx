// ...existing code...
import { useEffect } from 'react';
import { useAtom, } from 'jotai';
import { Socket, characterAtom, myIdAtom, mapAtom} from "./SocketConnection.js";

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(characterAtom);
  const [_myId, setMyId] = useAtom(myIdAtom);
  
  const [_mapAtom, setMap] = useAtom(mapAtom);

  useEffect(() => {
    const onConnect = () => {
      console.log('connect', Socket.id, { connected: Socket.connected });
      if (Socket.id) setMyId(Socket.id);
    };
    const onDisconnect = (reason) => console.log('disconnect', reason);

    
    const onWelcome = (value) => {
      console.log('welcome', value);
      setCharacters(value.characters);
      setMyId(value.id);
      setMap(value.map);

    };
    const onCharacters = (value) => {
      setCharacters(value);
      // Inferir myId si no está fijado y el socket.id coincide con algún character
      if (!_myId && Socket.id) {
        const found = value.find((c) => String(c.id) === String(Socket.id));
        if (found) {
          console.log('inferred myId from characters:', found.id);
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
    Socket.connect();

    return () => {
      Socket.off('connect', onConnect);
      Socket.off('disconnect', onDisconnect);
      Socket.off('welcome', onWelcome);
      Socket.off('characters', onCharacters);
    };
  }, [setCharacters, setMyId, setMap ,_myId]);

  return null;
};
