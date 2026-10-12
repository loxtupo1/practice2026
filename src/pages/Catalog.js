import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GameTile from '../components/GameTile';
import { fetchGames } from '../services/gameService';
import { samples } from '../data/games';
import { useAuth } from '../context/AuthContext';

const DEALS_API = 'https://www.cheapshark.com/api/1.0/deals?pageSize=18&sortBy=DealRating&desc=1&upperPrice=60';

export default function Catalog() {
  const { isAdmin } = useAuth();
  const [games, setGames] = useState(samples);
  const [apiGames, setApiGames] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('__all__');
  const [budget, setBudget] = useState('any');
  const [prices, setPrices] = useState({});
  const [genre, setGenre] = useState('__all__');
  const [sort, setSort] = useState('popular');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    fetchGames().then((data) => {
      if (active) {
        const allGames = new Map(samples.map((game) => [game.title.trim().toLowerCase(), game]));
        data.forEach((game) => allGames.set(game.title.trim().toLowerCase(), game));
        setGames([...allGames.values()]);
      }
    }).catch(() => {
      if (active) setNotice('Показываем редакционную подборку. Общая коллекция появится после подключения Firebase.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(DEALS_API, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('API response error');
        return response.json();
      })
      .then((data) => {
        const unique = new Map();
        data.forEach((deal) => {
          if (deal.gameID && !unique.has(deal.gameID)) unique.set(deal.gameID, deal);
        });
        setApiGames([...unique.values()]);
        setApiError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setApiError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setApiLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;
    const linkedGames = games.filter((game) => game.cheapSharkGameId);
    if (!linkedGames.length) {
      setPrices({});
      return () => { active = false; };
    }
    Promise.all(linkedGames.map(async (game) => {
      try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${encodeURIComponent(game.cheapSharkGameId)}`);
        if (!response.ok) return [game.id, null];
        const data = await response.json();
        const values = (Array.isArray(data.deals) ? data.deals : [])
          .map((deal) => Number(deal.price))
          .filter((price) => Number.isFinite(price) && price >= 0);
        return [game.id, values.length ? Math.min(...values) : null];
      } catch {
        return [game.id, null];
      }
    })).then((entries) => {
      if (active) setPrices(Object.fromEntries(entries.filter(([, price]) => price !== null)));
    });
    return () => { active = false; };
  }, [games]);
  const genres = [{ value: '__all__', label: '\u0412\u0441\u0435 \u0436\u0430\u043d\u0440\u044b' }, ...Array.from(new Set(games.map((game) => game.genre).filter(Boolean)), (value) => ({ value, label: value }))];
  const platforms = [{ value: '__all__', label: '\u0412\u0441\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b' }, ...Array.from(new Set(games.flatMap((game) => (game.platform || '').split(/[·,]/).map((item) => item.trim()).filter(Boolean))), (value) => ({ value, label: value }))];
  const pricedGames = useMemo(() => {
    const dealPrices = new Map(apiGames
      .map((deal) => [deal.title.trim().toLowerCase(), Number(deal.salePrice)])
      .filter(([, price]) => Number.isFinite(price) && price >= 0));
    return games.map((game) => ({
      ...game,
      currentPrice: prices[game.id] ?? dealPrices.get((game.title || '').trim().toLowerCase()) ?? null
    }));
  }, [games, apiGames, prices]);
  const filtered = useMemo(() => pricedGames
    .filter((game) => (genre === '__all__' || game.genre === genre) && game.title.toLowerCase().includes(search.toLowerCase()))
    .filter((game) => platform === '__all__' || (game.platform || '').split(/[·,]/).some((item) => item.trim() === platform))
    .filter((game) => budget === 'any' || (game.currentPrice != null && game.currentPrice <= Number(budget)))
    .sort((a, b) => sort === 'price' ? ((a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity) || a.title.localeCompare(b.title)) : sort === 'popular' ? (b.rating || 0) - (a.rating || 0) : (b.year || 0) - (a.year || 0)), [pricedGames, genre, platform, budget, search, sort]);

  return <main>
    {isAdmin && <section className="admin-welcome" aria-label="Панель администратора">
      <div><span className="eyebrow">АДМИНИСТРАТОР</span><strong>Панель управления каталогом</strong><p>Добавляй игры и редактируй каталог сайта.</p></div>
      <Link className="button" to="/admin">Открыть админку <span aria-hidden="true">→</span></Link>
    </section>}
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> ТВОЙ ПУТЕВОДИТЕЛЬ В МИРЕ ИГР</div>
        <h1>Найди свою<br /><em>следующую</em> игру.</h1>
        <p>Тысячи миров. Одна точка входа.<br />Подборки, оценки и игры от сообщества.</p>
        <a className="button hero-button" href="#catalog">Открыть каталог <span>↓</span></a>
        <div className="hero-proof"><div className="proof-avatars"><i>J</i><i>M</i><i>A</i><i>+</i></div><span><b>Твоя следующая игра</b><br />уже ждёт в каталоге</span></div>
      </div>
      <div className="hero-art"><img src="https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg" alt="Атмосфера видеоигр" /><div className="art-vignette" /><div className="art-caption"><span className="caption-dot" /> ВЫБОР РЕДАКЦИИ<strong>ИСТОРИИ, КОТОРЫЕ ОСТАЮТСЯ</strong></div><div className="art-stamp">PLAY<br />MORE<span>✳</span></div></div>
      <div className="hero-index">01 <span>/</span> 04 <b>→</b></div>
    </section>

    <section className="catalog-section" id="catalog">
      <div className="section-top"><div><div className="eyebrow muted">01 — БИБЛИОТЕКА</div><h2>Игры, в которые <em>стоит</em> сыграть.</h2></div><Link to="/explore" className="text-link">Посмотреть скидки <span>↗</span></Link></div>
      <div className="catalog-toolbar"><div className="catalog-count"><strong>{String(filtered.length).padStart(2, '0')}</strong><span>ИГР В КАТАЛОГЕ</span></div>
        <label className="search-box"><span>⌕</span><input placeholder="Название игры…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select aria-label="Genre" value={genre} onChange={(event) => setGenre(event.target.value)}>{genres.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select aria-label="Platform" value={platform} onChange={(event) => setPlatform(event.target.value)}>{platforms.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select aria-label="Максимальная цена" value={budget} onChange={(event) => setBudget(event.target.value)}><option value="any">Любой бюджет</option><option value="10">До $10</option><option value="20">До $20</option><option value="40">До $40</option><option value="60">До $60</option></select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">По рейтингу</option><option value="price">Сначала дешевле</option><option value="new">Сначала новые</option></select>
      </div>
      {notice && <p className="soft-notice">{notice}</p>}
      <div className="game-grid">{filtered.map((game, index) => <GameTile key={game.id} game={game} index={index} />)}</div>
      {!filtered.length && <div className="empty-state"><span>◌</span><h3>Подходящих игр не нашлось</h3><p>Для фильтра по бюджету нужны игры с найденной ценой.</p><button className="button button-outline" onClick={() => { setSearch(''); setPlatform('__all__'); setBudget('any'); setGenre('__all__'); }}>Сбросить фильтры</button></div>}
      <div className="section-end"><span>ПОКАЗАНО {String(filtered.length).padStart(2, '0')} ИЗ {String(games.length).padStart(2, '0')}</span><span className="end-line" /><span>ЛИСТАЙ И НАХОДИ</span><span>↓</span></div>
    </section>

    <section className="catalog-section api-games-section">
      <div className="section-top"><div><div className="eyebrow muted">02 — CHEAPSHARK API</div><h2>Ещё игры <em>из каталога.</em></h2><p className="api-games-lead">Подборка игр из внешнего каталога. Открой карточку, чтобы посмотреть подробности.</p></div><Link to="/explore" className="text-link">Все скидки <span>↗</span></Link></div>
      {apiLoading ? <div className="api-games-state"><span className="spinner" /> Загружаем игры из API…</div>
        : apiError ? <div className="api-games-state">Не удалось получить игры из API. <Link to="/explore">Открыть страницу скидок</Link></div>
          : <div className="game-grid">{apiGames.slice(0, 8).map((deal, index) => {
            const rating = Number(deal.metacriticScore) ? Number(deal.metacriticScore) / 10 : Number(deal.steamRatingPercent) ? Number(deal.steamRatingPercent) / 10 : 0;
            const apiGame = { id: `api-${deal.gameID}`, title: deal.title, genre: 'Внешний каталог', year: deal.releaseDate ? new Date(Number(deal.releaseDate) * 1000).getFullYear() : 'PC', rating, platform: 'PC', coverUrl: deal.thumb };
            return <GameTile key={deal.gameID} game={apiGame} index={index} />;
          })}</div>}
      <p className="api-games-credit">Игры и обложки загружаются через CheapShark API.</p>
    </section>

    <section className="community-banner"><div className="community-noise" /><div><div className="eyebrow">03 — ТВОЯ ИГРОВАЯ ПОЛКА</div><h2>У каждой игры<br />есть <em>своя история.</em></h2></div><div className="banner-right"><p>Собирай личную коллекцию, делись находками и оставляй заметки для будущего себя.</p><Link className="button" to="/register">Создать свою полку <span>↗</span></Link></div></section>
  </main>;
}
