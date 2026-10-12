import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteGame, ensureSampleGames } from '../services/gameService';
import { imageFor } from '../data/games';

export default function Admin() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(() => {
    setLoading(true);
    setError('');
    ensureSampleGames()
      .then(setGames)
      .catch((loadError) => {
        const code = loadError?.code ? ` (${loadError.code})` : '';
        const message = loadError?.message ? ` ${loadError.message}` : '';
        setError(`Не удалось загрузить каталог.${code}${message}`);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (game) => {
    if (!window.confirm(`Удалить «${game.title}» из общего каталога?`)) return;
    setNotice('');
    try {
      await deleteGame(game.id);
      setGames((current) => current.filter((item) => item.id !== game.id));
      setNotice(`Игра «${game.title}» удалена.`);
    } catch {
      setError('Не удалось удалить игру. Проверь, опубликованы ли новые правила Firestore.');
    }
  };

  return <main className="dashboard admin-page">
    <div className="eyebrow">ПАНЕЛЬ УПРАВЛЕНИЯ · ДОСТУП ПО РОЛИ FIREBASE</div>
    <div className="dash-head"><div><h1>Админ <em>панель.</em></h1><p>Управление общим каталогом игр.</p></div><div className="admin-actions"><button className="button button-outline" onClick={load} disabled={loading}>Обновить</button><Link className="button" to="/admin/new">＋ Добавить игру</Link></div></div>
    <div className="admin-summary"><strong>{games.length}</strong><span>ИГР В ОБЩЕМ КАТАЛОГЕ</span></div>
    {error && <p className="error-note">{error}</p>}{notice && <p className="admin-notice">{notice}</p>}
    {loading ? <div className="api-games-state"><span className="spinner" /> Загружаем каталог…</div>
      : games.length ? <div className="admin-game-list">{games.map((game) => <article className="admin-game" key={game.id}>
        <img src={imageFor(game)} alt="" />
        <div className="admin-game-info"><span className="tile-genre">{game.genre || 'Без жанра'} · {game.year || '—'}</span><h2>{game.title}</h2><p>Автор: {game.ownerName || 'не указан'} · Оценка: {(Number(game.rating) > 0 ? Number(game.rating).toFixed(1) : '—')}</p></div>
        <div className="admin-game-actions"><Link to={`/games/${game.id}`}>Открыть</Link><Link to={`/admin/edit/${game.id}`}>Изменить</Link><button onClick={() => remove(game)}>Удалить</button></div>
      </article>)}</div> : <div className="empty-state"><h3>Каталог пуст</h3><p>Добавь первую игру, чтобы наполнить общий каталог.</p><Link className="button" to="/admin/new">Добавить игру</Link></div>}
  </main>;
}
