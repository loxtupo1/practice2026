import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_URL = 'https://www.cheapshark.com/api/1.0/deals?pageSize=30&sortBy=DealRating&desc=1&upperPrice=60';
const stores = { '1': 'Steam', '2': 'GamersGate', '3': 'Green Man Gaming', '7': 'GOG', '8': 'Origin', '11': 'Humble Store', '15': 'Fanatical', '23': 'EA', '25': 'Epic Games' };

export default function Explore() {
  const [deals, setDeals] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('dealRating');
  const [minDiscount, setMinDiscount] = useState(0);
  const controllerRef = useRef(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(API_URL, { signal: controller.signal });
      if (!response.ok) throw new Error('Сервис скидок временно недоступен.');
      setDeals(await response.json());
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Не удалось загрузить предложения.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  const shown = useMemo(() => deals
    .filter((deal) => deal.title.toLowerCase().includes(search.toLowerCase()) && Number(deal.savings) >= minDiscount)
    .sort((a, b) => Number(b[sort]) - Number(a[sort])), [deals, search, minDiscount, sort]);

  return <main className="explore-page deals-page">
    <div className="eyebrow">ВНЕШНИЙ API · CHEAPSHARK</div>
    <div className="explore-head">
      <div><h1>Горячие <em>скидки.</em></h1><p>Подборка цен на компьютерные игры в цифровых магазинах. Предложения загружаются из CheapShark.</p></div>
      <button className="button button-outline" onClick={load} disabled={busy}>{busy ? 'Загружаем…' : '↻ Обновить'}</button>
    </div>
    <div className="deals-toolbar">
      <label className="search-box"><span>⌕</span><input aria-label="Название игры" placeholder="Название игры…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <label className="deal-select"><span>СОРТИРОВКА</span><select aria-label="Сортировка" value={sort} onChange={(event) => setSort(event.target.value)}><option value="dealRating">Лучшая сделка</option><option value="savings">Размер скидки</option><option value="salePrice">Цена: дешевле</option><option value="metacriticScore">Оценка Metacritic</option></select></label>
      <label className="deal-select"><span>СКИДКА ОТ</span><select aria-label="Минимальная скидка" value={minDiscount} onChange={(event) => setMinDiscount(Number(event.target.value))}><option value="0">Любая</option><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option></select></label>
      <span className="deals-count">Показано: <b>{shown.length}</b></span>
    </div>
    <div className="api-status"><b>GET</b><code>{API_URL}</code><span>· {busy ? 'загрузка' : error ? 'ошибка' : '200 OK'}</span><a href="https://apidocs.cheapshark.com/" target="_blank" rel="noreferrer">Данные: CheapShark API ↗</a></div>
    {busy ? <div className="empty-state"><span className="spinner" />Загружаем предложения…</div>
      : error ? <div className="empty-state"><span>!</span><h3>Не удалось загрузить скидки</h3><p>{error}</p><button className="button" onClick={load}>Попробовать ещё раз</button></div>
        : !shown.length ? <div className="empty-state"><h3>Предложений не найдено</h3><p>Измени запрос или минимальный размер скидки.</p></div>
          : <div className="game-grid explore-grid deals-grid">{shown.map((deal) => <a className="game-tile deal-card" href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`} target="_blank" rel="noreferrer" key={deal.dealID}>
            <div className="tile-image"><img src={deal.thumb} alt={deal.title} loading="lazy" /><span className="deal-discount">-{Math.round(Number(deal.savings))}%</span>{deal.metacriticScore !== '0' && <span className="tile-rating">{deal.metacriticScore}</span>}</div>
            <div className="tile-info"><div><span className="tile-genre">{stores[deal.storeID] || 'Магазин ПК-игр'}</span><span className="tile-year">{deal.steamRatingText || 'Игра для ПК'}</span></div><h3>{deal.title}</h3><p className="deal-prices"><del>${Number(deal.normalPrice).toFixed(2)}</del><strong>${Number(deal.salePrice).toFixed(2)}</strong></p><span className="deal-cta">Перейти к предложению ↗</span></div>
          </a>)}</div>}
  </main>;
}
