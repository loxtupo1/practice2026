import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GameTile from '../components/GameTile';
import { useWishlist } from '../context/WishlistContext';

const playStatuses = [
  ['want', 'Хочу сыграть'],
  ['playing', 'Играю'],
  ['played', 'Пройдена'],
  ['paused', 'Отложена'],
];

function ShelfEntry({ game, index, updateDetails }) {
  const [personalRating, setPersonalRating] = useState(game.personalRating ?? '');
  useEffect(() => {
    setPersonalRating(game.personalRating ?? '');
  }, [game.personalRating]);
  const saveRating = () => {
    const rating = personalRating === '' ? null : Number(personalRating);
    if (rating !== game.personalRating) updateDetails(game.id, { personalRating: rating });
  };

  return <div className="wishlist-entry">
    <GameTile game={game} index={index} />
    <div className="shelf-tracker">
      <label>Статус прохождения
        <select value={game.playStatus || 'want'} onChange={(event) => updateDetails(game.id, { playStatus: event.target.value })}>
          {playStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Моя оценка
        <select value={personalRating} onChange={(event) => setPersonalRating(event.target.value)} onBlur={saveRating}>
          <option value="">Пока без оценки</option>
          {Array.from({ length: 11 }, (_, rating) => <option key={rating} value={rating}>{rating} / 10</option>)}
        </select>
      </label>
    </div>
  </div>;
}

export default function Wishlist() {
  const { games, loading, syncError, updateDetails } = useWishlist();
  return <main className="dashboard wishlist-page">
    <div className="eyebrow">ТВОЙ ЛИЧНЫЙ СПИСОК</div>
    <div className="dash-head"><div><h1>Хочу <em>сыграть.</em></h1><p>Сравнивай цены в магазинах, отмечай прохождение и ставь личные оценки.</p></div><span className="wishlist-count">{games.length} {games.length === 1 ? 'игра' : 'игр'}</span></div>
    {syncError && <p className="error-note wishlist-error">{syncError}</p>}
    {loading ? <div className="api-games-state"><span className="spinner" /> Загружаем список…</div>
      : games.length ? <div className="game-grid wishlist-grid">{games.map((game, index) => <ShelfEntry key={game.id} game={game} index={index} updateDetails={updateDetails} />)}</div>
        : <div className="empty-state"><span>♡</span><h3>Список пока пуст</h3><p>Нажми на плюс на карточке игры, чтобы сохранить её здесь.</p><Link className="button" to="/#catalog">Найти игру</Link></div>}
  </main>;
}
