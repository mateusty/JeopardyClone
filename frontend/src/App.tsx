import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false
});


function App() {
  const [roomId, setRoomId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [roomIdRequest, setRoomIdRequest] = useState<string>('');
  
  useEffect(() => {
    socket.connect()
    socket.on('room-id', (roomId: string) => {
      setRoomId(roomId);
    })
    socket.on('message-response', (message: string) => {
      setMessageResponse(message);
    })
    
    return () => {
      socket.disconnect();
      socket.off('room-id')
    }
  }, [])
  
  const createRoom = () => {
    if(roomId.length === 0) {
      socket.emit('create-room')
    }
  }

  const joinRoom = () => {
    console.log(`Joining room with Id: ${roomIdRequest}`); 
    socket.emit('join-room', roomIdRequest);
  }

  const sendMessage = () => {
    socket.emit('message', {message: message, roomId: roomId})
  }

  return (
    <>
      <button onClick={createRoom}>Create Room</button>
      <p>{roomId}</p>

      <div>
        <input type="text" value={roomIdRequest} onChange={(e) => setRoomIdRequest(e.target.value)}/>
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
        <button onClick={sendMessage}>Send Message</button>
        <p>{messageResponse}</p>
      </div>
    </>
  )
}

export default App
