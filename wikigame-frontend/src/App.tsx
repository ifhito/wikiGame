import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [body, setBody] = useState('');
  const webSocket = useRef<WebSocket>();
  // const ws = new WebSocket('ws://localhost:80/')
  const apiCall = {
    url: 'https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0'
  }
  useEffect(() => {
    webSocket.current = new WebSocket("ws://localhost:80/");
    webSocket.current.onopen = () => {console.log('open');webSocket.current?.send(JSON.stringify(apiCall))}
    webSocket.current.onmessage = async ({data}) => {
        console.log('test')
        const json = await JSON.parse(data);
        setBody(json);
    };
    return () => webSocket.current?.close();
}, []);
  
  return (
    <>
    <div dangerouslySetInnerHTML={ { __html: body } }/>
    </>
  );
}

export default App;
