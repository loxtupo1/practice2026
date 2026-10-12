import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGameById, createGame, updateGame } from '../services/gameService';

const blank = { title: '', genre: '', year: '', rating: 0, ratingSource: '', platform: 'PC', description: '', coverUrl: '', cheapSharkGameId: '', cheapSharkTitle: '' };
const platformOptions = ['PC', 'PS5', 'Xbox', 'Switch', 'PS4', 'Xbox One', 'Steam Deck', 'macOS', 'Linux'];
const normalizeTitle = (title) => (title || '').toLowerCase().replace(/[^a-z0-9а-яё]/gi, '');

async function loadLinkedGame(match, signal) {
  const response = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${encodeURIComponent(match.gameID)}`, { signal });
  if (!response.ok) throw new Error('Could not load linked game');
  const details = await response.json();
  const deals = details.deals || [];
  const metacritic = deals.map((deal) => Number(deal.metacriticScore)).find((score) => Number.isFinite(score) && score > 0);
  const steam = deals.map((deal) => Number(deal.steamRatingPercent)).find((score) => Number.isFinite(score) && score > 0);
  return {
    cheapSharkGameId: match.gameID,
    cheapSharkTitle: match.external,
    coverUrl: details.info?.thumb || match.thumb || '',
    rating: metacritic ? metacritic / 10 : steam ? steam / 10 : 0,
    ratingSource: metacritic ? 'Metacritic' : steam ? 'Steam' : '',
  };
}

export default function GameForm({ adminCatalog = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(blank);
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedPlatforms = data.platform.split('·').map((platform) => platform.trim()).filter(Boolean);

  useEffect(() => {
    if (id) fetchGameById(id).then(setData).catch(() => setError('Игра не найдена.'));
  }, [id]);

  useEffect(() => {
    const title = data.title.trim();
    if (!title || data.cheapSharkGameId) {
      setMatches([]);
      return undefined;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=8`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search failed');
        const results = await response.json();
        if (!controller.signal.aborted) {
          const exact = results.find((match) => normalizeTitle(match.external) === normalizeTitle(title));
          if (exact) {
            const linkedGame = await loadLinkedGame(exact, controller.signal);
            if (controller.signal.aborted) return;
            setData((current) => ({ ...current, ...linkedGame }));
            setMatches([]);
            setSearching(false);
          } else setMatches(results.slice(0, 6));
        }
      } catch (searchError) {
        if (searchError.name !== 'AbortError' && !controller.signal.aborted) setMatches([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [data.title, data.cheapSharkGameId]);

  const change = (event) => {
    const { name, value } = event.target;
    setData((current) => name === 'title'
      ? { ...current, title: value, cheapSharkGameId: '', cheapSharkTitle: '', coverUrl: current.cheapSharkGameId ? '' : current.coverUrl, rating: 0, ratingSource: '' }
      : { ...current, [name]: value });
  };

  const chooseMatch = async (match) => {
    const titleAtSelection = data.title.trim();
    setMatches([]);
    setSearching(true);
    try {
      const linkedGame = await loadLinkedGame(match);
      setData((current) => current.title.trim() === titleAtSelection ? { ...current, ...linkedGame } : current);
    } catch {
      setError('Не удалось загрузить оценку и обложку выбранной игры. Попробуй выбрать её ещё раз.');
    } finally {
      setSearching(false);
    }
  };

  const togglePlatform = (platform) => {
    const next = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((item) => item !== platform)
      : [...selectedPlatforms, platform];
    setData((current) => ({ ...current, platform: next.join(' · ') }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedPlatforms.length) {
      setError('Выбери хотя бы одну платформу.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (id) await updateGame(id, data);
      else await createGame(data, user, adminCatalog);
      navigate(adminCatalog ? '/admin' : '/dashboard');
    } catch (saveError) {
      setError(saveError.code === 'permission-denied' ? 'Нет прав на изменение этой игры.' : saveError.message || 'Не удалось сохранить игру.');
    } finally {
      setSaving(false);
    }
  };

  return <main className="form-page">
    <Link className="back-link" to={adminCatalog ? '/admin' : '/dashboard'}>← {adminCatalog ? 'В админку' : 'Моя полка'}</Link>
    <div className="eyebrow">{id ? 'РЕДАКТИРОВАНИЕ' : 'НОВАЯ ЗАПИСЬ'}</div>
    <h1>{id ? 'Обнови' : 'Добавь'} <em>игру.</em></h1>
    <p>Заполни карточку и при желании привяжи игру к предложению в магазине.</p>
    <form className="game-form" onSubmit={submit}>
      <label>Название игры
        <input required minLength="2" name="title" value={data.title} onChange={change} placeholder="Например, Hades II" />
      </label>
      <div className="price-match-box">
        <div className="price-match-intro"><div><strong>Цены в магазинах</strong><span>Выбери игру из каталога, чтобы показать актуальные предложения в карточке.</span></div><span className="price-match-source">CHEAPSHARK</span></div>
        {data.cheapSharkGameId
          ? <div className="price-match-selected">{data.coverUrl && <img src={data.coverUrl} alt="" />}<span className="price-match-check">✓</span><span>Обложка и цены для <b>{data.cheapSharkTitle}</b> подключены</span><button type="button" onClick={() => setData((current) => ({ ...current, cheapSharkGameId: '', cheapSharkTitle: '' }))}>Выбрать другую</button></div>
          : searching ? <p className="price-match-hint">Ищем совпадения…</p>
            : matches.length ? <div className="price-match-options">{matches.map((match) => <button type="button" key={match.gameID} onClick={() => chooseMatch(match)}><span>{match.external}</span><small>{match.cheapest ? `от $${Number(match.cheapest).toFixed(2)}` : 'цена уточняется'}</small><b aria-hidden="true">↗</b></button>)}</div>
              : <p className="price-match-hint">{data.title.trim() ? 'Совпадений пока нет — попробуй английское название.' : 'Начни вводить название игры.'}</p>}
      </div>
      <div className="form-row">
        <label>Жанр<input required name="genre" value={data.genre} onChange={change} placeholder="Roguelike" /></label>
        <label>Год выпуска<input required type="number" min="1970" max="2035" name="year" value={data.year} onChange={change} placeholder="2024" /></label>
      </div>
      <div className="form-row">
        <fieldset className="platform-picker">
          <legend>Платформы</legend>
          <div>{platformOptions.map((platform) => <button type="button" key={platform} aria-pressed={selectedPlatforms.includes(platform)} className={selectedPlatforms.includes(platform) ? 'is-selected' : ''} onClick={() => togglePlatform(platform)}>{selectedPlatforms.includes(platform) && <span aria-hidden="true">✓ </span>}{platform}</button>)}</div>
          <small>{selectedPlatforms.length ? selectedPlatforms.join(' · ') : 'Выбери одну или несколько платформ'}</small>
        </fieldset>
      </div>
      <label>Короткое описание<textarea required minLength="8" rows="4" name="description" value={data.description} onChange={change} placeholder="Чем эта игра запомнилась?" /></label>
      {error && <p className="error-note">{error}</p>}
      <button className="button" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить игру ↗'}</button>
    </form>
  </main>;
}
