import React from "react";
import { useAuth } from "../context/AuthContext";

export const Header = ({ searchQuery, setSearchQuery, onNavigate }) => {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo" onClick={() => onNavigate("home")}>
        🎮 GameCatalog
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Поиск игр..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="nav-actions">
        <button className="btn" onClick={() => onNavigate("admin")}>
          + Добавить игру
        </button>
        {user ? (
          <div className="user-info">
            <span>{user.displayName}</span>
            <button className="btn btn-secondary" onClick={logout}>Выйти</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={loginWithGoogle}>
            Войти через Google
          </button>
        )}
      </div>
    </header>
  );
};