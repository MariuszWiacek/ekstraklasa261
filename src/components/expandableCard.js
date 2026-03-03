import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';

const ExpandableCard = ({ user, bets, results, hideTypes }) => {
  const gamesPerKolejka = 9;
  const [currentKolejka, setCurrentKolejka] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const groupedBets = Object.keys(bets || {}).reduce((acc, key) => {
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
    const [home, away] = result.split(':');
    if (home === away) return 'X';
    return home > away ? '1' : '2';
  };

  const shouldHide =
    hideTypes &&
    hideTypes[user] &&
    hideTypes[user][currentKolejka];

  return (
    <div className="paper-card">
      <h4 onClick={() => setExpanded(!expanded)}>
        {user} {expanded ? '-' : '+'}
      </h4>

      {expanded && (
        <div>
          <Pagination
            currentPage={currentKolejka}
            totalPages={totalKolejkas}
            onPageChange={setCurrentKolejka}
            label="Kolejka"
          />

          {groupedBets[currentKolejka]?.map((bet) => (
            <div key={bet.id}>
              <span>{bet.home}</span> vs <span>{bet.away}</span> |

              {shouldHide ? (
                <>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>
                    Typ: [ ✔ ]
                  </span> |
                  <span style={{ color: 'green' }}>[ ✔ ]</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'blue' }}>
                    Typ: [ {bet.bet} ]
                  </span> |
                  <span>{bet.score}</span>
                </>
              )}

              <span> Wynik: {results[bet.id]}</span>

              {bet.score === results[bet.id] && <span> ✅</span>}
              {getTypeFromResult(results[bet.id]) === bet.bet && <span> ☑️</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;