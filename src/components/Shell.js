import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function Shell() {
  const { user, isAdmin } = useAuth();
  const { games } = useWishlist();
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('gamescout-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('gamescout-theme', theme);
  }, [theme]);

  const closeMenu = () => setMenu(false);
  return <div className="site-shell">
    <header className="topbar"><div className="nav-wrap">
      <Link to="/" className="brand" onClick={closeMenu}><span className="brand-mark">G</span><span>КАРТРИДЖ<small>КАТАЛОГ ИГР</small></span></Link>
      <button className="mobile-menu" type="button" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? '×' : '☰'}</button>
      <nav className={menu ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/" onClick={closeMenu}>Главная</NavLink>
        <NavLink to="/#catalog" onClick={closeMenu}>Каталог</NavLink>
        <NavLink to="/explore" onClick={closeMenu}>Скидки</NavLink>
        <NavLink to="/wishlist" onClick={closeMenu}>Хочу сыграть <span className="wishlist-nav-count">{games.length}</span></NavLink>
        {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Админка</NavLink>}
        {user && <NavLink to="/dashboard" onClick={closeMenu}>{'\u041c\u043e\u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438'}</NavLink>}
        {user && <NavLink to="/profile" onClick={closeMenu}>{'\u041f\u0440\u043e\u0444\u0438\u043b\u044c'}</NavLink>}
      </nav>
      <div className="nav-actions">
        <button type="button" className="theme-toggle" aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} title="Сменить тему" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾' : '☀'}</button>
        {user ? <Link className="profile-link" to="/profile" title="Profile"><span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>{user.photoURL ? <img className="avatar" src={user.photoURL} alt="" /> : <span className="avatar">{(user.displayName || user.email || 'G')[0].toUpperCase()}</span>}</Link> : <><Link className="login-link" to="/login">Войти</Link><Link className="button button-small" to="/register">Регистрация <span>↗</span></Link></>}
      </div>
    </div></header>
    <div className="site-main"><Outlet /></div>
    <footer className="footer"><Link to="/" className="brand"><span className="brand-mark">G</span><span>КАРТРИДЖ</span></Link><span>Находи игры, которые останутся с тобой.</span><span>© 2026 · Учебный проект на React</span></footer>
  </div>;
}
