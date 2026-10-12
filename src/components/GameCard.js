import React from "react";

export const GameCard = ({ game, onSelect }) => {
  return (
    <div className="game-card" onClick={() => onSelect(game.id)}>
      <img src={game.coverUrl || "https://via.placeholder.com/300x180"} alt={game.title} />
      <div className="game-card-content">
        <h3>{game.title}</h3>
        <p className="genre-badge">{game.genre}</p>
        <div className="game-card-footer">
          <span className="rating">★ {game.rating}</span>
          <span className="platform">{game.platform}</span>
        </div>
      </div>
    </div>
  );
};