import React, { useEffect, useState } from 'react';

export default function Chat({ socket, user, api }) {
  const [online, setOnline] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('private:message', (msg) => {
      setMessages(m => [...m, msg]);
    });
    socket.on('presence:update', ids => setOnline(ids));
    return () => {
      socket.off('private:message');
      socket.off('presence:update');
    };
  }, [socket]);

  const send = () => {
    if (!active || !text) return;
    socket.emit('private:send', { toUserId: active, content: text });
    setText('');
  };

  const doSearch = async () => {
    if (!searchUser) return alert('enter username');
    const res = await fetch(`${api}/api/auth/search?username=${encodeURIComponent(searchUser)}`);
    const data = await res.json();
    if (data.error) return alert(data.error);
    setSearchResult(data);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 280, borderRight: '1px solid #ddd', padding: 12 }}>
        <h3>Logged in as: {user.username || user.firstName}</h3>
        <div style={{ marginTop: 12 }}>
          <input placeholder="Search username" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
          <button onClick={doSearch}>Search</button>
          {searchResult && (
            <div style={{ marginTop: 8, padding: 8, border: '1px solid #eee' }}>
              <div><strong>{searchResult.username}</strong></div>
              <div>{searchResult.firstName} {searchResult.lastName}</div>
              <div>ID: {searchResult.id}</div>
            </div>
          )}
        </div>

        <h4 style={{ marginTop: 18 }}>Online Users</h4>
        <ul>
          {online.map(id => (
            <li key={id} style={{ cursor: 'pointer', padding: 6, background: active===id? '#f0f0f0': 'transparent' }} onClick={() => setActive(id)}>
              {id} {active===id && ' (active)'}
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ textAlign: m.from === user.id ? 'right' : 'left', margin: 6 }}>
              <div style={{ display: 'inline-block', padding: 8, borderRadius: 6, background: '#f3f3f3' }}>{m.content}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid #ddd', display: 'flex', gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Message" style={{ flex: 1 }} />
          <button onClick={send}>Send</button>
        </div>
      </main>
    </div>
  );
}