import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false
});


function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [text, setText] = useState<string>('');
  
  useEffect(() => {
    socket.connect()
    
    return () => {
      socket.disconnect();
    }
  }, [])
  
  const sendMessage = () => {
    console.log("Enviando mensagem")
    socket.emit('message', inputValue)
  }
  
  socket.on('response', (text: string) => {
    console.log(text)
    setText(text);
  })

  return (
    <>
      <input onChange={(e) => setInputValue(e.target.value)} value={inputValue}/>
      <button onClick={sendMessage}>Clique me para mandar uma mensagem</button>
      <p>{text}</p>
    </>
  )
}

export default App
