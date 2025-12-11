import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Login from './pages/Login';
import Chat from './components/Chat';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const s = io(API, { auth: { token } });
      setSocket(s);
      return () => s.disconnect();
    }
  }, [token]);

  if (!token) return <Login onAuth={(t, u) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setToken(t); setUser(u); }} api={API} />;

  return <Chat socket={socket} user={user} api={API} />;
}