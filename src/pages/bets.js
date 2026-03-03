import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import usersData from '../gameData/users.json';
import gameData from '../gameData/data.json';
import teamsData from '../gameData/teams.json';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import ExpandableCard from '../components/expandableCard';
import Pagination from '../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_AUTH",
  databaseURL: "YOUR_DB",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth();
const database = getDatabase();

const groupGamesIntoKolejki = (games) => {
  const kolejki = [];
  games.forEach((game, index) => {
    const kolejkaId = Math.floor(index / 9) + 1;
    game.kolejkaId = kolejkaId;
    game.disabled = game.id >= 12 && game.id <= 18;

    if (!kolejki[kolejkaId - 1]) {
      kolejki[kolejkaId - 1] = { id: kolejkaId, games: [] };
    }
    kolejki[kolejkaId - 1].games.push(game);
  });
  return kolejki;
};

const Bets = () => {
  const [kolejki, setKolejki] = useState(groupGamesIntoKolejki(gameData));
  const [selectedUser, setSelectedUser] = useState('');
  const [submittedData, setSubmittedData] = useState({});
  const [results, setResults] = useState({});
  const [currentKolejkaIndex, setCurrentKolejkaIndex] = useState(0);
  const [hideTypes, setHideTypes] = useState({});

  useEffect(() => {
    const lastUser = localStorage.getItem('selectedUser');
    if (lastUser) setSelectedUser(lastUser);

    auth.onAuthStateChanged((user) => {
      if (user) setSelectedUser(user.displayName);
    });

    onValue(ref(database, 'submittedData'), snap => {
      const data = snap.val();
      if (data) setSubmittedData(data);
    });

    onValue(ref(database, 'results'), snap => {
      const data = snap.val();
      if (data) setResults(data);
    });

    onValue(ref(database, 'hideTypes'), snap => {
      const data = snap.val();
      if (data) setHideTypes(data);
    });
  }, []);

  const autoDetectBetType = (score) => {
    const [home, away] = score.split(':').map(Number);
    if (home === away) return 'X';
    return home > away ? '1' : '2';
  };

  const handleScoreChange = (gameId, scoreInput) => {
    const cleaned = scoreInput.replace(/[^0-9:]/g, '');
    const formatted = cleaned.replace(/^(?:(\d))([^:]*$)/, '$1:$2');

    const updated = kolejki.map(k => ({
      ...k,
      games: k.games.map(g =>
        g.id === gameId
          ? { ...g, score: formatted, bet: autoDetectBetType(formatted) }
          : g
      )
    }));
    setKolejki(updated);
  };

  const handleSubmit = () => {
    if (!selectedUser) return alert('Wybierz użytkownika.');

    const current = kolejki[currentKolejkaIndex];
    const newBets = {};

    current.games.forEach(game => {
      if (game.score) {
        newBets[game.id] = {
          home: game.home,
          away: game.away,
          score: game.score,
          bet: autoDetectBetType(game.score),
          kolejkaId: game.kolejkaId
        };
      }
    });

    update(ref(database, `submittedData/${selectedUser}`), newBets)
      .then(() => alert('Zakłady zapisane!'))
      .catch(() => alert('Błąd zapisu.'));
  };

  const handleHideToggle = (value) => {
    update(ref(database, `hideTypes/${selectedUser}`), {
      [currentKolejkaIndex]: value
    });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <FontAwesomeIcon icon={faUser} />
      <select value={selectedUser} onChange={(e) => {
        setSelectedUser(e.target.value);
        localStorage.setItem('selectedUser', e.target.value);
      }}>
        <option value="">Użytkownik</option>
        {Object.keys(usersData).map(user =>
          <option key={user} value={user}>{user}</option>
        )}
      </select>

      <Pagination
        currentPage={currentKolejkaIndex}
        totalPages={kolejki.length}
        onPageChange={setCurrentKolejkaIndex}
        label="Kolejka"
      />

      {kolejki[currentKolejkaIndex]?.games.map(game => (
        <div key={game.id}>
          {game.home} - {game.away}
          <input
            value={game.score || ''}
            onChange={(e) => handleScoreChange(game.id, e.target.value)}
            placeholder="x:x"
          />
        </div>
      ))}

      <div style={{ margin: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={hideTypes[selectedUser]?.[currentKolejkaIndex] || false}
            onChange={(e) => handleHideToggle(e.target.checked)}
          />
          Ukryj typy po wysłaniu
        </label>
      </div>

      <button onClick={handleSubmit}>Prześlij</button>

      {Object.keys(submittedData).map(user => (
        <ExpandableCard
          key={user}
          user={user}
          bets={submittedData[user]}
          results={results}
          hideTypes={hideTypes}
        />
      ))}
    </div>
  );
};

export default Bets;