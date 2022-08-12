import Game from "./components/Game";
import './components/styles.css';
import { initializeApp } from "firebase/app";
import { useState } from "react";
import { query, orderBy, limit, onSnapshot, collection, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDhXVm4LyILFSjZ0qns1P48BakjxJYel-A",
  authDomain: "find-the-characters-odin.firebaseapp.com",
  projectId: "find-the-characters-odin",
  storageBucket: "find-the-characters-odin.appspot.com",
  messagingSenderId: "569340801648",
  appId: "1:569340801648:web:356b534ff3af563268bab5"
};

const app = initializeApp(firebaseConfig);

function App() {

  const [ game, setGame ] = useState(0);
  const [ leaderboard, setLeaderboard ] = useState(0);
  const [ leaderboardList, setLeaderboardList ] = useState([]);
  const games = [1, 2, 3];

  const pickGame = (num) => {
    setGame(num);
  }

  const loadLeaderboard = (coll) => {
    const recentMessagesQuery = query(collection(getFirestore(), coll), orderBy('score', 'asc'), limit(10));
    let aux = [];
    onSnapshot(recentMessagesQuery, function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            aux.push(change.doc.data());
        });
    });
    return aux;
  }

  const showLeaderboard = (num) => {
    let aux = loadLeaderboard(`maps/map${num}/leaderboard`);
    setLeaderboardList(aux);
    setTimeout(() => {
      setLeaderboard(num);
    }, 1200)
  }

  return (
    <div className="App">
      {(game === 0) ? 
        <div id="game-selection">
          <header>
            <h1>Find the Characters</h1>
          </header>
          <div id="levels">
            {games.map((num) => 
              <div key={num} className='level-container'>
                <button className="level"  onClick={() => pickGame(num)} 
                    style={{backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/map${num}.jpg)`}}></button>
                <div className="bottom">
                  <p>{'Level ' + num}</p>
                  <button onClick={() => showLeaderboard(num)}>Leaderboard</button>
                </div>
              </div>
            )}
          </div>
          {(leaderboard > 0) ? 
            <div className='leaderboard'> 
              <h3>Leaderboard</h3>
              { (leaderboardList.length > 0) ? 
                <div id="scores">
                  {leaderboardList.map ((score) => {
                    return(<div className='score' key={score.id}>
                                <p>{score.name}</p>
                                <p>{score.score.toDate().toTimeString().substring(0, 9)}</p>
                            </div>)
                    })}
                </div>
              : '' }
              <div className="buttons">
                <button onClick={() => setLeaderboard(0)}>Go back</button>
                <button onClick={() => setGame(leaderboard)}>Play this Level</button>
              </div>
           </div>
          : ''}
        </div>
      : 
        <Game game={game} reset={() => setGame(0)} loadLeaderboard={loadLeaderboard} />
      } 
    </div>
  );
}

export default App;
