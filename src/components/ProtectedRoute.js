import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute(){const {user,loading}=useAuth(),location=useLocation();if(loading)return <div className="center-page">Загружаем профиль…</div>;return user?<Outlet/>:<Navigate to="/login" state={{from:location}} replace/>;}
