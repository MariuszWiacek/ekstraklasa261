import React, { useState, useEffect } from 'react';
import '../styles/card.css'; 
import Pagination from './Pagination';

const ExpandableCard = ({ user, bets, results }) => {
  const gamesPerKolejka = 9;
  const [currentKolejka, setCurrentKolejka] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const groupedBets = Object.keys(bets).reduce((acc, key) => {
    const betID = parseInt(key, 10);
    const kolejkaIndex = Math.floor((betID - 1) / gamesPerKolejka);
    if (!acc[kolejkaIndex]) acc[kolejkaIndex] = [];
    acc[kolejkaIndex].push({ id: key, ...bets[key] });
    return acc;
  }, []);

  const totalKolejkas = groupedBets.length;

  useEffect(() => {
    if (totalKolejkas > 0) {
      setCurrentKolejka(totalKolejkas - 1);
    }
  }, [totalKolejkas]);

  const getTypeFromResult = (result) => {
    if (!result) return null;
    const [homeScore, awayScore] = result.split(':');
    if (homeScore === awayScore) return 'X';
    return homeScore > awayScore ? '1' : '2';
  };

  return (
    <div className="card-container">
      <h4 className="header-style" onClick={() => setExpanded(!expanded)}>
        {user} {expanded ? '-' : '+'}
      </h4>

      {expanded && (
        <div className="card-content">
          <Pagination
            currentPage={currentKolejka}
            totalPages={totalKolejkas}
            onPageChange={(page) => setCurrentKolejka(page)}
            label="Kolejka"
          />
          {groupedBets[currentKolejka]?.map((bet) => {
            // Logic: Hide if flagged and no result exists yet
            const isHidden = bet.isHidden && !results[bet.id];

            return (
              <div key={bet.id} style={{ fontSize: '10px' }}>
                <span style={{ color: 'black' }}>
                  {bet.home} vs. <span style={{ color: 'black' }}>{bet.away}</span> |{' '}
                </span>
                {isHidden ? (
                  <>
                    <span style={{ color: 'green' }}>Typ: [ ✔️ ]</span> |{' '}
                    <span style={{ color: 'green' }}>[ ✔️ ]</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'blue' }}>Typ: [ {bet.bet} ]</span> |{' '}
                    <span style={{ color: 'black' }}>{bet.score}</span>
                  </>
                )}
                <span className="results-style"> Wynik: </span>
                <span>{results[bet.id]}</span>
                {!isHidden && bet.score === results[bet.id] && <span className="correct-score">✅</span>}
                {!isHidden && getTypeFromResult(results[bet.id]) === bet.bet && <span className="correct-type">☑️</span>}
              </div>
            );
          })}
          <hr />
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;
