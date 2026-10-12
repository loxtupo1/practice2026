import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, removeWishlistGame, saveWishlistGame } from '../services/wishlistService';

const WishlistContext = createContext(null);
const GUEST_KEY = 'cartridge-wishlist:guest';
const LEGACY_KEY = 'cartridge-wishlist';
const accountKey = (userId) => `cartridge-wishlist:${userId}`;

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((game) => game && game.id) : [];
  } catch {
    return [];
  }
}

function describeSyncError(error) {
  return `Firestore (${error?.code || 'ошибка'}): ${error?.message || 'проверь подключение и правила доступа.'}`;
}

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState(() => readList(GUEST_KEY).length ? readList(GUEST_KEY) : readList(LEGACY_KEY));
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;
    setLoading(true);
    setSyncError('');

    if (!user) {
      const guestGames = readList(GUEST_KEY).length ? readList(GUEST_KEY) : readList(LEGACY_KEY);
      setGames(guestGames);
      setLoading(false);
      return () => { active = false; };
    }

    const sync = async () => {
      const guestGames = readList(GUEST_KEY).length ? readList(GUEST_KEY) : readList(LEGACY_KEY);
      const accountGames = readList(accountKey(user.uid));
      try {
        const remoteGames = await fetchWishlist(user.uid);
        const merged = new Map(remoteGames.map((game) => [game.id, game]));
        accountGames.forEach((game) => merged.set(game.id, game));
        guestGames.forEach((game) => merged.set(game.id, game));
        const next = [...merged.values()];
        await Promise.all([...accountGames, ...guestGames].map((game) => saveWishlistGame(user.uid, game)));
        if (!active) return;
        localStorage.setItem(accountKey(user.uid), JSON.stringify(next));
        localStorage.removeItem(GUEST_KEY);
        localStorage.removeItem(LEGACY_KEY);
        setGames(next);
      } catch (error) {
        if (!active) return;
        setGames(accountGames.length ? accountGames : guestGames);
        setSyncError(`Не удалось синхронизировать список. ${describeSyncError(error)}`);
      } finally {
        if (active) setLoading(false);
      }
    };

    sync();
    return () => { active = false; };
  }, [user, authLoading]);

  const toggle = useCallback(async (game) => {
    const exists = games.some((item) => item.id === game.id);
    const next = exists ? games.filter((item) => item.id !== game.id) : [...games, game];
    setGames(next);
    setSyncError('');
    localStorage.setItem(user ? accountKey(user.uid) : GUEST_KEY, JSON.stringify(next));
    if (!user) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }
    try {
      if (exists) await removeWishlistGame(user.uid, game.id);
      else await saveWishlistGame(user.uid, game);
    } catch (error) {
      setSyncError(`Изменение сохранено на этом устройстве, но не синхронизировано. ${describeSyncError(error)}`);
    }
  }, [games, user]);

  const updateDetails = useCallback(async (gameId, details) => {
    const next = games.map((game) => game.id === gameId ? { ...game, ...details } : game);
    setGames(next);
    setSyncError('');
    localStorage.setItem(user ? accountKey(user.uid) : GUEST_KEY, JSON.stringify(next));
    if (!user) return;
    try {
      const updated = next.find((game) => game.id === gameId);
      if (updated) await saveWishlistGame(user.uid, updated);
    } catch (error) {
      setSyncError(`РР·РјРµРЅРµРЅРёРµ СЃРѕС…СЂР°РЅРµРЅРѕ РЅР° СЌС‚РѕРј СѓСЃС‚СЂРѕР№СЃС‚РІРµ, РЅРѕ РЅРµ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРѕ. ${describeSyncError(error)}`);
    }
  }, [games, user]);

  const value = useMemo(() => ({
    games,
    toggle,
    updateDetails,
    loading,
    syncError,
    has: (id) => games.some((game) => game.id === id)
  }), [games, toggle, updateDetails, loading, syncError]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
