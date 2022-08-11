import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, addDoc, doc, serverTimestamp,
         query, orderBy, limit, onSnapshot, } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import uniqid from 'uniqid';
import database from './database';

function Game(props) {

    const { game, reset, loadLeaderboard } = props;
    const [ coords, setCoords ] = useState({top: -1000, left: -1000})
    const [ random, setRandom ] = useState([]);
    const [ start, setStart ] = useState(false);
    const [ clock, setClock ] = useState(new Date(2018, 11, 24, 0, 0, 0, 0));
    const [ timer, setTimer ] = useState(0);
    const [ over, setOver ] = useState(false);
    const [ message, setMessage ] = useState(''); 
    const [ ogSize, setOgSize ] = useState({}); 
    const [ size, setSize ] = useState({});
    const [ player, setPlayer ] = useState('Anonymous');
    const [ leaderboard, setLeaderboard ] = useState([]);
    const [ submitted, setSubmitted ] = useState(false);
    const [ displayLB, setDisplayLB ] = useState(true);
    let data;
    //const [ database, setDatabase ] = useState([]);
    //const [ name, setName ] = useState('');
    //const [ id, setId ] = useState('');
    //const chars = database;

    const firestore = getFirestore();

    async function getCollection(db, string) {
        const dataCol = collection(db, string);
        const dataSnapshot = await getDocs(dataCol);
        const dataList = dataSnapshot.docs.map(doc => doc.data());
        return dataList;
    }

    //async function saveData(x1, x2, name, id, y1, y2, coll) {
    //    try {
    //    await addDoc(collection(firestore, coll), {
    //        name: name,
    //        xStart: x1,
    //        xEnd: x2,
    //        yStart: y1,
    //        yEnd: y2,
    //        url: '',
    //        id: id
    //    });
    //    }
    //    catch(error) {
    //        console.error('Error writing new message to Firebase Database', error);
    //    }
    //}

    const saveScore = async (data, coll) => {
        try {
            await addDoc(collection(firestore, coll), {
                score: data,
                timestamp: serverTimestamp(),
                name: player,
                id: uniqid(),
            });
        }
        catch (error) {
            console.error('Error writing new message to Firebase Database', error);
        }
    }

    useEffect(() => {
        data = getCollection(firestore, `maps/map${game}/characters`);    
        //if (id === '') {
        //    setId('1');
        //    setTimeout(() => {
        //        chars.forEach((item) => {
        //            saveData(item.xStart, item.xEnd, item.name, item.id, item.yStart, item.yEnd, 'maps/map3/characters')
        //        })
        //    }, 2000) ;           
        //} 
    }, []);

    useEffect(() => {
        if (data.length === 0 ) return;
        if (data.length === undefined) {
            Promise.resolve(data).then((val) =>{
                data = val;
                fillRandom();
            });
            setLeaderboard(loadLeaderboard(`maps/map${game}/leaderboard`));            
        }  
    }, [data]);

    useEffect(() => {
        if (document.getElementById('game-img')) {
            let img = document.getElementById('game-img');
            if (ogSize.width === undefined) {
                setOgSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                })
                handleResize();
            }
        } 
        function handleResize() {
            if (document.getElementById('game-img')) {
                const img = document.getElementById('game-img');
                const elemRect = img.getBoundingClientRect();
                setSize({
                    width: elemRect.width,
                    height: elemRect.height,
                    circle: (80 * elemRect.width) / 1920,
                });
                setCoords({top: -1000, left: -1000})
            }    
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [coords]);

    useEffect(() => {
        if (random.length === 0 || coords.top !== -1000) return
        let over = true;
        for (let i = 0; i < 3; i ++) {
            if (random[i].found === false) over = false;
        }
        if (over === true) {
            setTimer(timer => clearInterval(timer));
            setOver(true);
        }
    }, [coords])
    
    const onClick = (e) => {
        let offset = getOffset(e.target);
        let x = e.pageX - offset.left;
        let y = e.pageY - offset.top;
        setCoords({top: y, left: x});
    }

    //const pushChar = () => {
    //    setDatabase(database.concat({
    //        xStart: coords.left - (size.circle / 2),
    //        yStart: coords.top - (size.circle / 2),
    //        xEnd: coords.left + (size.circle / 2),
    //        yEnd: coords.top + (size.circle / 2),
    //        name: name,
    //        id: id
    //    }))
    //    console.log(database);
    //}

    const getOffset = (target) =>{
        let bodyRect = document.body.getBoundingClientRect();
        let elemRect = target.getBoundingClientRect();
        let top = elemRect.top - bodyRect.top;
        let left = elemRect.left - bodyRect.left;
        return {top: top, left: left}
    }

    const fillRandom = () => {
        let aux = data;
        let randAux = [];
        for (let i = 0; i < 3; i++) {
            let num = Math.floor(Math.random() * aux.length);
            randAux[i] = aux[num];
            randAux[i].found = false;
            aux.splice(num, 1);
        }
        setRandom(randAux);
    }

    const checkFound = (id) => {
        let aux = random;
        for (let i = 0; i < 3; i ++) {
            if (aux[i].id === id) {
                let result = isBetweenBoundaries(aux[i]);
                aux[i].found = result;
                if (result === true) {
                    setMessage(`You found ${aux[i].name}!`);
                    setTimeout(() => {
                        setMessage('');
                    }, 3000)
                }
                else {
                    setMessage(`That's not ${aux[i].name}!`);
                    setTimeout(() => {
                        setMessage('');
                    }, 3000)
                }
            }
        }
        setCoords({top: -1000, left: -1000})
        setRandom(aux);
    }

    const isBetweenBoundaries = (char) => {
        let left = (char.xStart * size.width) / ogSize.width;
        let right = (char.xEnd * size.width) / ogSize.width;
        let top = (char.yStart * size.height) / ogSize.height;
        let bottom = (char.yEnd * size.height) / ogSize.height;
        if (left <= coords.left && right >= coords.left &&
            top <= coords.top && bottom >= coords.top)
        return true;
        else return false;
    }

    const startGame = () => {
        setStart(true);
        setTimer(setInterval(() => {
            let newTime = clock;
            newTime.setSeconds(newTime.getSeconds() + 1);
            setClock(new Date(newTime));
        }, 1000));
        setCoords({top: -1000, left: -1000})
    }

    const onSubmit = () => {
        setDisplayLB(false);
        saveScore(clock, `maps/map${game}/leaderboard`);
        setLeaderboard([]);
        let aux = loadLeaderboard(`maps/map${game}/leaderboard`);       
        setLeaderboard(aux);        
        setSubmitted(true);
        setTimeout(() => {
            setDisplayLB(true);
        }, 300)  
    }

    if (start === true)
    
    return (
      <div id='game-container'>
        <div id='game-ui'>
            <p id='clock'>{clock.toTimeString().substring(0, 9)}</p>
            <p id='to-home'>Home</p>
            <div id='to-find'>
                {(random.length > 0) ? random.map ((char) => 
                    <div key={char.id} className={(char.found === true) ? 'character found' : 'character'}>
                        <img src={char.url} alt={char.name}></img>
                        <p>{char.name}</p>
                    </div> 
                    ) : ''}
            </div>
        </div>
        <div id="game">
            <img onClick={onClick} src={`${process.env.PUBLIC_URL}/assets/images/map${game}.jpg`} alt={`map ${game}`} id='game-img'></img>
            <div id='modal' style={{top: coords.top - (size.circle / 2), left: coords.left - (size.circle / 2)}}>
                <div id='circle' style={{width: size.circle, height: size.circle}}></div>
                <div id='picker'>
                    {(random.length > 0) ? random.map ((char) => (char.found === false) ?
                    <button key={char.id} onClick={() => checkFound(char.id)} className='choice'>{char.name}</button> :
                    '') : ''}

                </div>
            </div>
            {(random.length > 0) ? 
            random.map (char => <div key={char.id} className='found circle' style={(char.found === true) ?
                 {left:(char.xStart * size.width) / ogSize.width, top: (char.yStart * size.height) / ogSize.height,
                    width: size.circle, height: size.circle} : {top: -1000, left: -1000}}></div>) 
            : ''}
        </div>
        {(over === true) ? 
            <div id='over'>
                <h3>Your Score:</h3>
                <h1>{clock.toTimeString().substring(0, 9)}</h1>
                <div id='leaderboard'> 
                    {(displayLB === true) ? leaderboard.map ((score) => {
                        return(<div className='score' key={score.id}>
                                    <p>{score.name}</p>
                                    <p>{score.score.toDate().toTimeString().substring(0, 9)}</p>
                                </div>)
                    }) : ''}
                </div>
                {((leaderboard.length < 10  || leaderboard[9].score.toDate() > clock) && submitted === false) ? 
                    <div id='form'>
                        <p>You got a new highscore!</p>
                        <input onChange={(e) => setPlayer(e.target.value)} maxLength='12'></input>
                        <button onClick={onSubmit}>Submit</button>
                    </div> : ''}
                                    
                <button onClick={reset}>Continue</button>
                
            </div> 
        : ''}
        {(message !== '') ? 
            <div id='message'>
                <p>{message}</p>
            </div>
        : ''}
      </div>
    );

    else 
    return (
        <div id='preview' style={{backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/map${game}.jpg)`}}>
            <button onClick={startGame}>Ready?</button>
        </div>
    )
}

export default Game;

//For adding more maps

//<input onChange={(e) => setName(e.target.value)}></input>
//<input onChange={(e) => setId(e.target.value)}></input>
//<button onClick={pushChar}>click</button>