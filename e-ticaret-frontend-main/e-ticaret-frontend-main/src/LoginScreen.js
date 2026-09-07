import React, { useState } from 'react';
import './App.css';

const LoginScreen = ({ onLogin }) => {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const validCredentials = role === 'admin'
      ? username === 'admin' && password === 'admin123'
      : username === 'satici' && password === 'satici123';

    if (!validCredentials) {
      setError('Kullanıcı adı veya şifre hatalı.');
      return;
    }

    setError('');
    onLogin(role);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">📦</div>
        <h1>E-Ticaret Yönetim Paneli</h1>
        <p className="login-subtitle">Devam etmek için hesabınızı seçin</p>
        <div className="role-tabs" role="tablist" aria-label="Kullanıcı rolü">
          <button
            type="button"
            className={role === 'admin' ? 'active' : ''}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            Admin
          </button>
          <button
            type="button"
            className={role === 'seller' ? 'active' : ''}
            onClick={() => { setRole('seller'); setError(''); }}
          >
            Satıcı
          </button>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Kullanıcı adı</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit">Giriş Yap</button>
        </form>
      </section>
    </main>
  );
};

export default LoginScreen;
