import React from 'react';
import { Link } from 'react-router-dom';
import { imageFor } from '../data/games';
import { useWishlist } from '../context/WishlistContext';

export default function GameTile({ game, index = 0, onSelect }) {
  const { has, toggle } = useWishlist();
  const saved = has(game.id);
  const rating = Number(game.rating || 0);
  return <article className="game-tile">
    <Link to={`/games/${game.id}`} className="tile-open" onClick={onSelect}>
      <div className="tile-image"><img src={imageFor(game)} alt={game.title} loading="lazy" /><span className="tile-number">{String(index + 1).padStart(2, '0')}</span>{rating > 0 && <span className="tile-rating">★ {rating.toFixed(1)}</span>}</div>
      <div className="tile-info"><div><span className="tile-genre">{game.genre}</span><span className="tile-year">{game.year}</span></div><h3>{game.title}</h3><p>{game.platform || 'PC'}</p>{game.currentPrice != null && <p className="tile-price">от ${Number(game.currentPrice).toFixed(2)}</p>}</div>
    </Link>
    <button type="button" className={`tile-save${saved ? ' is-saved' : ''}`} aria-label={saved ? `Убрать ${game.title} из отложенных` : `Отложить ${game.title}`} title={saved ? 'Убрать из отложенных' : 'В список желаемого'} aria-pressed={saved} onClick={() => toggle({ id: game.id, title: game.title, genre: game.genre, year: game.year, rating: game.rating, platform: game.platform, coverUrl: game.coverUrl, developer: game.developer, ownerName: game.ownerName, description: game.description })}>{saved ? '♥' : '＋'}</button>
  </article>;
}
