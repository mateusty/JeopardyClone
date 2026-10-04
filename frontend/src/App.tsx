import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false
});


function App() {
  const [roomId, setRoomId] = useState<string>('');
  const [roomIds, setRoomIds] = useState<string[]>([]);
  
  useEffect(() => {
    socket.connect()
    socket.on('room-id', (roomId: string) => {
      setRoomId(roomId);
    })

    socket.on('room-ids', (roomIds: string[]) => {
      setRoomIds(roomIds);
    })
    
    return () => {
      socket.disconnect();
    }
  }, [])
  
  const sendMessage = () => {
    console.log("Enviando mensagem")
    socket.emit('create-room')
  }

  const requestAllRooms = () => {
    socket.emit('request-rooms')
  }

  return (
    <>
      <button onClick={sendMessage}>Clique me para mandar uma mensagem</button>
      <button onClick={requestAllRooms}>Clique me para listar as salas</button>
      <p>{roomId}</p>
      <ol>
        {roomIds.map((roomId) => <li>{roomId}</li>)}
      </ol>
    </>
  )
}

export default App
