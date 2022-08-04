import Game from "./components/Game";
import './components/styles.css';
import { initializeApp } from "firebase/app";
import database from './components/database';
import { useState } from "react";

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

  const pickGame = (num) => {
    setGame(num);
  }

  return (
    <div className="App">
      {(game === 0) ? 
        <button onClick={() => pickGame(1)}>lvl1</button>
      : 
        <Game game={game} reset={() => setGame(0)} />
      } 
    </div>
  );
}

export default App;
