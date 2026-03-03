import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import usersData from '../gameData/users.json';
import gameData from '../gameData/data.json';
import teamsData from '../gameData/teams.json';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import ExpandableCard from '../components/expandableCard';
import Pagination from '../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';

const firebaseConfig = {
    apiKey: "AIzaSyB3AOrOzAQ-WVMjeZ3ayNwklR7axBgXJ0I",
    authDomain: "wiosna26-951d6.firebaseapp.com",
    databaseURL: "https://wiosna26-951d6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wiosna26-951d6",
    storageBucket: "wiosna26-951d6.firebasestorage.app",
    messagingSenderId: "58145083288",
    appId: "1:58145083288:web:f2d813d31a64bcdfcba5ed",
    measurementId: "G-0R5JLD75SW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth();
const database = getDatabase();

const groupGamesIntoKolejki = (games) => {
    const kolejki = [];
    games.forEach((game, index) => {
        const currentKolejkaId = Math.floor(index / 9) + 1;
        game.kolejkaId = currentKolejkaId;
        if (!kolejki[currentKolejkaId - 1]) {
            kolejki[currentKolejkaId - 1] = { id: currentKolejkaId, games: [] };
        }
        kolejki[currentKolejkaId - 1].games.push(game);
    });
    return kolejki;
};

const Bets = () => {
    const [kolejki, setKolejki] = useState(groupGamesIntoKolejki(gameData));
    const [selectedUser, setSelectedUser] = useState('');
    const [submittedData, setSubmittedData] = useState({});
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);
    const [results, setResults] = useState({});
    const [currentKolejkaIndex, setCurrentKolejkaIndex] = useState(0);
    const [areInputsEditable, setAreInputsEditable] = useState(true);
    const [isHiddenRound, setIsHiddenRound] = useState(false); // New State

    useEffect(() => {
        const lastChosenUser = localStorage.getItem('selectedUser');
        if (lastChosenUser) setSelectedUser(lastChosenUser);

        auth.onAuthStateChanged((user) => {
            if (user) setSelectedUser(user.displayName);
        });

        onValue(ref(database, 'submittedData'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSubmittedData(data);
                setIsDataSubmitted(true);
            }
        });

        onValue(ref(database, 'results'), (snapshot) => {
            const data = snapshot.val();
            if (data) setResults(data);
        });

        const now = new Date();
        const nextGameIndex = gameData.findIndex(game => new Date(`${game.date}T${game.kickoff}:00+02:00`) > now);
        const index = nextGameIndex !== -1 ? Math.floor(nextGameIndex / 9) : 0;
        setCurrentKolejkaIndex(index);
    }, []);

    const isReadOnly = (user, gameId) => submittedData[user] && submittedData[user][gameId];

    const gameStarted = (gameDate, gameKickoff) => {
        const now = DateTime.now().setZone('Europe/Warsaw');
        const kickoff = DateTime.fromISO(`${gameDate}T${gameKickoff}:00`, { zone: 'Europe/Warsaw' });
        return now >= kickoff;
    };

    const autoDetectBetType = (score) => {
        if (!score.includes(':')) return '';
        const [home, away] = score.split(':').map(Number);
        if (home === away) return 'X';
        return home > away ? '1' : '2';
    };

    const handleScoreChange = (gameId, scoreInput) => {
        const cleaned = scoreInput.replace(/[^0-9:]/g, '');
        const updated = kolejki.map(kolejka => ({
            ...kolejka,
            games: kolejka.games.map(game => 
                game.id === gameId ? { ...game, score: cleaned, bet: autoDetectBetType(cleaned) } : game
            )
        }));
        setKolejki(updated);
    };

    const handleSubmit = () => {
        if (!selectedUser) { alert('Proszę wybrać użytkownika.'); return; }

        const currentKolejka = kolejki[currentKolejkaIndex];
        const userSubmittedBets = submittedData[selectedUser] || {};
        
        const newBetsToSubmit = currentKolejka.games.reduce((acc, game) => {
            if (game.score && !userSubmittedBets[game.id]) {
                acc[game.id] = {
                    home: game.home,
                    away: game.away,
                    score: game.score,
                    bet: autoDetectBetType(game.score),
                    kolejkaId: game.kolejkaId,
                    isHidden: isHiddenRound // Saving the hidden status
                };
            }
            return acc;
        }, {});

        if (Object.keys(newBetsToSubmit).length === 0) {
            alert("Brak nowych zakładów do wysłania.");
            return;
        }

        update(ref(database, `submittedData/${selectedUser}`), newBetsToSubmit)
            .then(() => {
                alert('Zakłady wysłane! ' + (isHiddenRound ? '(Ukryte)' : '(Publiczne)'));
            })
            .catch((error) => console.error('Error:', error));
    };

    const getTeamLogo = (name) => teamsData[name]?.logo || '';

    return (
        <div className="fade-in" style={{ textAlign: 'center', padding: '10px' }}>
            <div style={{ marginBottom: '20px' }}>
                <span style={{ color: 'white' }}>Użytkownik: </span>
                <select 
                    style={{ backgroundColor: 'pink', fontWeight: 'bold' }} 
                    value={selectedUser} 
                    onChange={(e) => { setSelectedUser(e.target.value); localStorage.setItem('selectedUser', e.target.value); }}
                >
                    <option value="">Wybierz...</option>
                    {Object.keys(usersData).map(user => <option key={user} value={user}>{user}</option>)}
                </select>
            </div>

            <div style={{ backgroundColor: '#212529ab', color: 'aliceblue', padding: '15px', borderRadius: '10px' }}>
                <Pagination 
                    currentPage={currentKolejkaIndex} 
                    totalPages={kolejki.length} 
                    onPageChange={setCurrentKolejkaIndex} 
                    label="Kolejka" 
                />

                {/* HIDDEN TICK BOX AREA */}
                <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '12px', color: isHiddenRound ? '#00FFAA' : '#ccc', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={isHiddenRound} 
                            onChange={(e) => setIsHiddenRound(e.target.checked)}
                            style={{ marginRight: '5px' }}
                        />
                        Ukryj moje typy w tej kolejce <FontAwesomeIcon icon={isHiddenRound ? faEyeSlash : faEye} />
                    </label>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ fontSize: '12px', color: 'gold' }}>
                            <th>Mecz</th>
                            <th>Wynik</th>
                            <th>Typ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kolejki[currentKolejkaIndex]?.games.map((game) => (
                            <React.Fragment key={game.id}>
                                <tr>
                                    <td colSpan="3" style={{ fontSize: '9px', color: 'gray', textAlign: 'left', padding: '5px 0 0 10px' }}>
                                        {game.date} | {game.kickoff}
                                    </td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #444', backgroundColor: gameStarted(game.date, game.kickoff) ? '#1a3321' : 'transparent' }}>
                                    <td style={{ textAlign: 'left', padding: '10px', fontSize: '14px' }}>
                                        <img src={getTeamLogo(game.home)} style={{ width: '20px', marginRight: '5px' }} />
                                        {game.home} - {game.away}
                                        <img src={getTeamLogo(game.away)} style={{ width: '20px', marginLeft: '5px' }} />
                                    </td>
                                    <td style={{ color: 'gold' }}>{results[game.id] || '-'}</td>
                                    <td>
                                        <input 
                                            style={{ 
                                                width: '45px', 
                                                textAlign: 'center',
                                                backgroundColor: isReadOnly(selectedUser, game.id) ? 'transparent' : 'white',
                                                color: isReadOnly(selectedUser, game.id) ? '#00FFAA' : 'black',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }} 
                                            placeholder={isReadOnly(selectedUser, game.id) ? '✔️' : 'x:x'}
                                            value={game.score || ''}
                                            onChange={(e) => handleScoreChange(game.id, e.target.value)}
                                            disabled={isReadOnly(selectedUser, game.id) || gameStarted(game.date, game.kickoff)}
                                        />
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                <button 
                    style={{ 
                        backgroundColor: '#DC3545', color: 'white', padding: '12px', 
                        width: '80%', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer' 
                    }} 
                    onClick={handleSubmit}
                >
                    Prześlij {isHiddenRound && '🔒'}
                </button>

                <div style={{ marginTop: '30px' }}>
                    {isDataSubmitted && Object.keys(submittedData).map((user) => (
                        <ExpandableCard key={user} user={user} bets={submittedData[user]} results={results} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Bets;
