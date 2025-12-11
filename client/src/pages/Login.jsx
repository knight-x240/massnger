import React, { useState } from 'react';

export default function Login({ onAuth, api }) {
  const [mode, setMode] = useState('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const url = `${api}/api/auth/${mode}`;
    const body = mode === 'login' ? { email, password } : { firstName, lastName, dateOfBirth: dob, phone, email, password };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.token) onAuth(data.token, data.user);
    else alert(data.error || 'Error');
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        {mode === 'register' && (
          <>
            <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            <input placeholder="Date of birth (YYYY-MM-DD)" value={dob} onChange={e => setDob(e.target.value)} />
            <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </>
        )}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Have account? Login'}</button>
        </div>
      </form>
    </div>
  );
}