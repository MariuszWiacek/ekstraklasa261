import React, { useState, useEffect } from 'react';
import '../styles/card.css';
import Pagination from './Pagination';
import { DateTime } from 'luxon';

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

    // Helper to check if the specific game has started
    // We assume the game data (date/time) is needed to auto-reveal
    // Since bets object usually contains home/away, you might need to cross-ref with gameData 
    // or just check if results[bet.id] exists as a proxy for "game finished/started"
    const isGameStarted = (betId) => {
        return !!results[betId]; 
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
                        onPageChange={setCurrentKolejka} 
                        label="Kolejka" 
                    />
                    {groupedBets[currentKolejka]?.map((bet) => {
                        // Logic: If 'isHidden' is true AND no result yet, show checkmark
                        const shouldHide = bet.isHidden && !results[bet.id];

                        return (
                            <div key={bet.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontSize: '10px' }}>
                                    <span style={{ color: 'black' }}>{bet.home}</span> vs. <span style={{ color: 'black' }}>{bet.away}</span> |{' '}
                                    {shouldHide ? (
                                        <>
                                            <span style={{ color: 'green' }}>Typ: [ ✔️ ]</span> | 
                                            <span style={{ color: 'green' }}> [ ✔️ ]</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: 'blue' }}>Typ: [ {bet.bet} ]</span> | 
                                            <span style={{ color: 'black' }}>{bet.score}</span>
                                        </>
                                    )}
                                    <span className="results-style"> Wynik: </span>
                                    <span>{results[bet.id] || '?-?'}</span>
                                    
                                    {!shouldHide && bet.score === results[bet.id] && <span className="correct-score">✅</span>}
                                    {!shouldHide && getTypeFromResult(results[bet.id]) === bet.bet && <span className="correct-type">☑️</span>}
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
