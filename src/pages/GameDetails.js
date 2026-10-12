import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchGameById } from '../services/gameService';
import { samples, imageFor } from '../data/games';
import GameTile from '../components/GameTile';
import PriceComparison from '../components/PriceComparison';
import { useWishlist } from '../context/WishlistContext';

const STORE_NAMES = { '1': 'Steam', '2': 'GamersGate', '3': 'Green Man Gaming', '7': 'GOG', '8': 'Origin', '11': 'Humble Store', '15': 'Fanatical', '23': 'EA', '25': 'Epic Games' };
const offerPrice = (deal) => {
  const value = deal?.salePrice ?? deal?.price;
  if (value === undefined || value === null || value === '') return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export default function GameDetails() {
  const { id } = useParams();
  const { has, toggle } = useWishlist();
  const [game, setGame] = useState(samples.find((item) => item.id === id));
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);
    setOffer(null);
    if (id.startsWith('demo-')) {
      setGame(samples.find((item) => item.id === id));
      return () => { active = false; };
    }
    if (id.startsWith('api-')) {
      setGame(null);
      fetch(`https://www.cheapshark.com/api/1.0/games?id=${encodeURIComponent(id.slice(4))}`)
        .then((response) => { if (!response.ok) throw new Error('Game API request failed'); return response.json(); })
        .then((data) => {
          if (!active) return;
          const info = data.info || {};
          const deals = Array.isArray(data.deals) ? data.deals : [];
          const bestDeal = deals
            .filter((deal) => deal.dealID && offerPrice(deal) !== null)
            .sort((a, b) => offerPrice(a) - offerPrice(b))[0];
          const best = bestDeal ? { ...bestDeal, salePrice: offerPrice(bestDeal) } : null;
          setOffer(best || null);
          setGame({ id, title: info.title || 'Игра', coverUrl: info.thumb, genre: 'Компьютерная игра', year: null, rating: Number.isFinite(Number(best?.metacriticScore)) && Number(best.metacriticScore) > 0 ? Number(best.metacriticScore) / 10 : null, platform: 'PC', description: 'Игра загружена из внешнего каталога CheapShark. Посмотри актуальные предложения магазинов и выбери подходящий вариант.' });
        })
        .catch(() => { if (active) setError(true); });
    } else {
      setGame(null);
      fetchGameById(id).then((data) => { if (active) setGame(data); }).catch(() => { if (active) setError(true); });
    }
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="center-page"><div className="eyebrow">404 — НЕ НАЙДЕНО</div><h1>Игра не загрузилась.</h1><p>Проверь соединение и попробуй открыть каталог ещё раз.</p><Link className="button" to="/">Вернуться в каталог</Link></main>;
  if (!game) return <main className="center-page"><span className="spinner" /><p>Загружаем карточку игры…</p></main>;

  const related = samples.filter((item) => item.id !== game.id).slice(0, 4);
  return <main className="detail-page detail-layout">
    <Link className="back-link" to="/">Каталог / {game.title}</Link>
    <div className="detail-cover"><img src={imageFor(game)} alt={game.title} />{Number.isFinite(Number(game.rating)) && game.rating !== null && Number(game.rating) > 0 && <span className="tile-rating">★ {Number(game.rating).toFixed(1)}</span>}</div>
    <section className="detail-copy">
      <div className="detail-tags"><span className="tile-genre">{game.genre || 'Игра'}</span><span className="detail-status">{id.startsWith('api-') ? 'ВНЕШНИЙ КАТАЛОГ' : 'В КАТАЛОГЕ'}</span></div>
      <div className="detail-title-row"><h1>{game.title}</h1><button type="button" className={`detail-favorite${has(game.id) ? ' is-saved' : ''}`} aria-pressed={has(game.id)} onClick={() => toggle({ id: game.id, title: game.title, genre: game.genre, year: game.year, rating: game.rating, platform: game.platform, coverUrl: game.coverUrl, developer: game.developer, ownerName: game.ownerName, description: game.description })}>{has(game.id) ? '♥ В избранном' : '♡ В избранное'}</button></div>
      <div className="detail-facts"><div><small>СТУДИЯ / АВТОР</small><b>{game.developer || game.ownerName || 'Игровая студия'}</b></div><div><small>ГОД ВЫПУСКА</small><b>{game.year || '—'}</b></div><div><small>ПЛАТФОРМЫ</small><b>{game.platform || 'PC'}</b></div><div><small>ОЦЕНКА</small><b className="detail-score">{Number(game.rating) > 0 ? Number(game.rating).toFixed(1) : '—'}</b></div></div>
      {!id.startsWith('api-') && <PriceComparison title={game.title} gameId={game.cheapSharkGameId} />}
      {offer && <div className="detail-offer"><div><small>ЛУЧШАЯ ЦЕНА СЕЙЧАС</small><strong>${Number(offer.salePrice).toFixed(2)}</strong><span>{STORE_NAMES[offer.storeID] || 'Цифровой магазин'}</span></div><a className="button" href={`https://www.cheapshark.com/redirect?dealID=${offer.dealID}`} target="_blank" rel="noreferrer">Смотреть предложение ↗</a></div>}
      <p className="detail-description">{game.description || 'Информация об этой игре добавлена в каталог сообщества.'}</p>
      {game.ownerName && <p className="detail-byline">ДОБАВИЛ(А): <strong>{game.ownerName}</strong></p>}
    </section>
    <section className="related-games"><div className="section-top"><div><div className="eyebrow muted">ЕЩЁ ИЗ КАТАЛОГА</div><h2>Может понравиться</h2></div><Link className="text-link" to="/#catalog">Все игры ↗</Link></div><div className="game-grid">{related.map((item, index) => <GameTile key={item.id} game={item} index={index} />)}</div></section>
  </main>;
}
