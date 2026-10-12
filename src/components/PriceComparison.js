import React, { useEffect, useState } from 'react';

const API = 'https://www.cheapshark.com/api/1.0';
const STORES = { '1': 'Steam', '2': 'GamersGate', '3': 'Green Man Gaming', '7': 'GOG', '8': 'Origin', '11': 'Humble Store', '15': 'Fanatical', '23': 'EA', '25': 'Epic Games' };
const normalize = (text) => (text || '').toLowerCase().replace(/[^a-z0-9а-яё]/gi, '');

export default function PriceComparison({ title, gameId }) {
  const [offers, setOffers] = useState([]);
  const [historicalLow, setHistoricalLow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        let matchedGameId = gameId;
        if (!matchedGameId) {
          const searchResponse = await fetch(`${API}/games?title=${encodeURIComponent(title)}&limit=30`, { signal: controller.signal });
          if (!searchResponse.ok) throw new Error('Search unavailable');
          const results = await searchResponse.json();
          const key = normalize(title);
          matchedGameId = results
            .map((result) => ({ result, key: normalize(result.external) }))
            .filter(({ key: candidate }) => candidate === key || candidate.startsWith(key) || key.startsWith(candidate))
            .sort((a, b) => Number(b.key === key) - Number(a.key === key))[0]?.result.gameID;
        }

        if (matchedGameId) {
          const response = await fetch(`${API}/games?id=${encodeURIComponent(matchedGameId)}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Price lookup unavailable');
          const data = await response.json();
          const deals = (data.deals || [])
            .filter((deal) => deal.dealID && Number.isFinite(Number(deal.price)))
            .sort((a, b) => Number(a.price) - Number(b.price));
          setOffers(deals);
          setHistoricalLow(data.cheapestPriceEver?.price ?? null);
        } else {
          setOffers([]);
          setHistoricalLow(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [title, gameId]);

  return <section className="detail-prices">
    <div className="detail-prices-head"><div><small>СРАВНЕНИЕ ЦЕН · CHEAPSHARK</small><h2>Где купить</h2></div>
      {historicalLow !== null && <span>Исторический минимум: <strong>${Number(historicalLow).toFixed(2)}</strong></span>}
    </div>
    {loading ? <p className="detail-prices-message">Проверяем цены в магазинах…</p>
      : failed ? <p className="detail-prices-message">Не удалось загрузить цены. Попробуй обновить страницу позже.</p>
        : offers.length ? <>
          {offers.slice(0, 5).map((deal) => <div className="detail-price-row" key={deal.dealID}>
            <strong>{STORES[deal.storeID] || 'Цифровой магазин'}</strong>
            <span>${Number(deal.price).toFixed(2)} <small>USD</small></span>
            <a href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`} target="_blank" rel="noreferrer">Купить ↗</a>
          </div>)}
          <p className="detail-prices-message">Цены указаны в долларах США и могут измениться на странице магазина.</p>
        </>
        : <p className="detail-prices-message">Игра не найдена среди предложений магазинов, которые отслеживает CheapShark.</p>}
  </section>;
}
