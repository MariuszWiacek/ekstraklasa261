import React, { useState, useEffect } from 'react';
import '../styles/card.css'; // Import your CSS file with styles
import Pagination from './Pagination';

const ExpandableCard = ({ user, bets, results }) => {
  const gamesPerKolejka = 9;
  const [currentKolejka, setCurrentKolejka] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Group bets into kolejkas based on their IDs
  const groupedBets = Object.keys(bets).reduce((acc, key) => {
    const betID = parseInt(key, 10); // Ensure ID is a number
    const kolejkaIndex = Math.floor((betID - 1) / gamesPerKolejka); // Determine kolejka index (0-based)
    if (!acc[kolejkaIndex]) acc[kolejkaIndex] = [];
    acc[kolejkaIndex].push({ id: key, ...bets[key] });
    return acc;
  }, []);

  const totalKolejkas = groupedBets.length;

  // Show the latest kolejka by default
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

  const handleKolejkaChange = (page) => {
    setCurrentKolejka(page);
  };

  return (
    <div className="card-container" style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
      <h4 className="header-style" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        {user} {expanded ? '-' : '+'}
      </h4>

      {expanded && (
        <div className="card-content">
          <Pagination
            currentPage={currentKolejka}
            totalPages={totalKolejkas}
            onPageChange={handleKolejkaChange}
            label="Kolejka"
          />

          {groupedBets[currentKolejka]?.map((bet) => {
            // New logic: hide only if flagged AND result is not yet available
            const isHidden = bet.isHidden && !results[bet.id];

            return (
              <div key={bet.id} style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '10px' }}>
                  <span style={{ color: 'black' }}>{bet.home} vs. </span>
                  <span style={{ color: 'black' }}>{bet.away} |{' '}</span>
                  
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
                  <span style={{ color: 'black' }}>{results[bet.id]}</span>
                  
                  {!isHidden && bet.score === results[bet.id] && <span className="correct-score">✅</span>}
                  {!isHidden && getTypeFromResult(results[bet.id]) === bet.bet && <span className="correct-type">☑️</span>}
                </div>
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
