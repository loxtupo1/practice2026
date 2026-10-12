import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="center-page"><span className="spinner" /><p>Проверяем права доступа…</p></main>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <main className="center-page">
    <div className="eyebrow">ДОСТУП ЗАКРЫТ</div>
    <h1>Нужны права администратора.</h1>
    <p>Войди в аккаунт с назначенной ролью администратора.</p>
    <Link className="button" to="/">Вернуться в каталог</Link>
  </main>;
  return <Outlet />;
}
