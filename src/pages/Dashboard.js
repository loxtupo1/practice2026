import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyGames, deleteGame } from '../services/gameService';
import { imageFor } from '../data/games';

const text = {
  eyebrow: '\u041c\u043e\u0439 \u043a\u0430\u0442\u0430\u043b\u043e\u0433',
  heading: '\u041c\u043e\u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438',
  intro: '\u0417\u0434\u0435\u0441\u044c \u0438\u0433\u0440\u044b, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0442\u044b \u0434\u043e\u0431\u0430\u0432\u0438\u043b \u0432 \u043e\u0431\u0449\u0438\u0439 \u043a\u0430\u0442\u0430\u043b\u043e\u0433. \u0418\u0445 \u043c\u043e\u0436\u043d\u043e \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438\u043b\u0438 \u0443\u0431\u0440\u0430\u0442\u044c.',
  add: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0438\u0433\u0440\u0443',
  loading: '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438...',
  error: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0433\u0440\u044b. \u041f\u0440\u043e\u0432\u0435\u0440\u044c \u043f\u0440\u0430\u0432\u0438\u043b\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 Firestore.',
  emptyTitle: '\u041f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442',
  emptyBody: '\u0414\u043e\u0431\u0430\u0432\u044c \u0438\u0433\u0440\u0443, \u0447\u0442\u043e\u0431\u044b \u043e\u043d\u0430 \u043f\u043e\u044f\u0432\u0438\u043b\u0430\u0441\u044c \u0432 \u043e\u0431\u0449\u0435\u043c \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435.',
  addFirst: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u0435\u0440\u0432\u0443\u044e \u0438\u0433\u0440\u0443',
  removeConfirm: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044e \u0438\u0437 \u043e\u0431\u0449\u0435\u0433\u043e \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430?',
  edit: '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c',
  remove: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => fetchMyGames(user.uid)
    .then(setGames)
    .catch(() => setError(text.error))
    .finally(() => setBusy(false)), [user.uid]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm(text.removeConfirm)) return;
    await deleteGame(id);
    load();
  };

  return <main className="dashboard">
    <div className="eyebrow">{text.eyebrow}</div>
    <div className="dash-head">
      <div><h1>{text.heading}</h1><p>{text.intro}</p></div>
      <Link to="/dashboard/new" className="button">+ {text.add}</Link>
    </div>
    {error && <p className="error-note">{error}</p>}
    {busy ? <p>{text.loading}</p> : games.length ? <div className="dash-list">
      {games.map((game) => <article className="dash-item" key={game.id}>
        <img src={imageFor(game)} alt="" />
        <div><span className="tile-genre">{game.genre} · {game.year}</span><h3>{game.title}</h3><p>★ {game.rating} · {game.platform}</p></div>
        <div className="dash-actions"><Link to={`/dashboard/edit/${game.id}`}>{text.edit}</Link><button onClick={() => remove(game.id)}>{text.remove}</button></div>
      </article>)}
    </div> : <div className="empty-state"><span>✳</span><h3>{text.emptyTitle}</h3><p>{text.emptyBody}</p><Link className="button" to="/dashboard/new">{text.addFirst}</Link></div>}
  </main>;
}
