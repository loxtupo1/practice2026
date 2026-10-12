import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const labels = {
  eyebrow: '\u041b\u0438\u0447\u043d\u044b\u0439 \u0430\u043a\u043a\u0430\u0443\u043d\u0442',
  title: '\u041c\u043e\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u044c',
  subtitle: '\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439 \u0434\u0430\u043d\u043d\u044b\u043c\u0438 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430 \u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u044c \u043f\u043e\u0434 \u0441\u0435\u0431\u044f.',
  nickname: '\u041d\u0438\u043a\u043d\u0435\u0439\u043c',
  nicknameError: '\u041d\u0438\u043a\u043d\u0435\u0439\u043c \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u043b\u0438\u043d\u043e\u0439 \u043e\u0442 2 \u0434\u043e 32 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.',
  avatar: '\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u0430\u0432\u0430\u0442\u0430\u0440',
  optional: '\u041d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e',
  email: '\u041f\u043e\u0447\u0442\u0430',
  role: '\u0420\u043e\u043b\u044c',
  admin: '\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440',
  player: '\u0418\u0433\u0440\u043e\u043a',
  collection: '\u0418\u0433\u0440 \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u043c',
  save: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f',
  saving: '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u043c...',
  logout: '\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430',
  wishlist: '\u041c\u043e\u044f \u043f\u043e\u043b\u043a\u0430',
  dashboard: '\u041c\u043e\u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438',
  saved: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d.',
  signOutHint: '\u0417\u0430\u0432\u0435\u0440\u0448\u0438 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u0441\u0435\u0430\u043d\u0441.',
  error: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c. \u041f\u0440\u043e\u0432\u0435\u0440\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438 \u043f\u043e\u043f\u044b\u0442\u043a\u0443.'
};

export default function Profile() {
  const { user, isAdmin, updateUserProfile, logout } = useAuth();
  const { games } = useWishlist();
  const [nickname, setNickname] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setNickname(user.displayName || '');
    setPhotoURL(user.photoURL || '');
  }, [user.displayName, user.photoURL]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (nickname.trim().length < 2) { setError(labels.nicknameError); return; }
    setSaving(true);
    try {
      await updateUserProfile({ displayName: nickname, photoURL });
      setMessage(labels.saved);
    } catch {
      setError(labels.error);
    } finally {
      setSaving(false);
    }
  };

  const initial = (nickname.trim() || user.email || 'G').charAt(0).toUpperCase();
  return <main className="profile-page">
    <div className="eyebrow">{labels.eyebrow}</div>
    <header className="profile-heading">
      <div><h1>{labels.title}</h1><p>{labels.subtitle}</p></div>
      <Link className="button button-outline" to="/">{'\u2190 \u0412 \u043a\u0430\u0442\u0430\u043b\u043e\u0433'}</Link>
    </header>
    <div className="profile-layout">
      <section className="profile-card profile-summary">
        <div className="profile-avatar">{photoURL ? <img src={photoURL} alt="" /> : <span>{initial}</span>}</div>
        <h2>{nickname || user.email?.split('@')[0]}</h2>
        <span className="profile-role">{isAdmin ? labels.admin : labels.player}</span>
        <div className="profile-stat"><strong>{games.length}</strong><span>{labels.collection}</span></div>
        <div className="profile-shortcuts"><Link to="/wishlist">{labels.wishlist} {'\u2197'}</Link><Link to="/dashboard">{labels.dashboard} {'\u2197'}</Link></div>
      </section>
      <section className="profile-card profile-settings">
        <form className="profile-form" onSubmit={submit}>
          <label>{labels.nickname}<input required minLength="2" maxLength="32" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="PlayerOne" /></label>
          <label>{labels.avatar} <small>({labels.optional})</small><input type="url" value={photoURL} onChange={(event) => setPhotoURL(event.target.value)} placeholder="https://example.com/avatar.jpg" /></label>
          <label>{labels.email}<input value={user.email || ''} readOnly /></label>
          {message && <p className="profile-message">{message}</p>}
          {error && <p className="error-note">{error}</p>}
          <button className="button" disabled={saving}>{saving ? labels.saving : labels.save}</button>
        </form>
        <div className="profile-danger-zone"><div><strong>{labels.logout}</strong><span>{labels.signOutHint}</span></div><button type="button" className="button button-outline" onClick={logout}>{labels.logout}</button></div>
      </section>
    </div>
  </main>;
}
