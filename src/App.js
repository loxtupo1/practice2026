import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Shell from './components/Shell';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Catalog from './pages/Catalog';
import GameDetails from './pages/GameDetails';
import Dashboard from './pages/Dashboard';
import GameForm from './pages/GameForm';
import AuthPage from './pages/AuthPage';
import Explore from './pages/Explore';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import './styles/App.css';
import './styles/GameTheme.css';

export default function App() {
  return <AuthProvider><WishlistProvider><BrowserRouter basename={import.meta.env.BASE_URL}><Routes><Route element={<Shell />}>
    <Route index element={<Catalog />} />
    <Route path="games/:id" element={<GameDetails />} />
    <Route path="explore" element={<Explore />} />
    <Route path="wishlist" element={<Wishlist />} />
    <Route path="login" element={<AuthPage mode="login" />} />
    <Route path="register" element={<AuthPage mode="register" />} />
    <Route element={<AdminRoute />}>
      <Route path="admin" element={<Admin />} />
      <Route path="admin/new" element={<GameForm adminCatalog />} />
      <Route path="admin/edit/:id" element={<GameForm adminCatalog />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route path="profile" element={<Profile />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="dashboard/new" element={<GameForm />} />
      <Route path="dashboard/edit/:id" element={<GameForm />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter></WishlistProvider></AuthProvider>;
}
