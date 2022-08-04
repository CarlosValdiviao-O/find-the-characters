import { useEffect, useState } from 'react';
import Image from './simpsons.jpg';
import database from './database';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

function Game(props) {

    const { game, reset } = props;
    const [ coords, setCoords ] = useState({top: -1000, left: -1000})
    const [ random, setRandom ] = useState([]);
    const [ start, setStart ] = useState(false);
    const [ clock, setClock ] = useState(new Date(2018, 11, 24, 0, 0, 0, 0));
    const [ timer, setTimer ] = useState(0);
    const [ over, setOver ] = useState(false);
    const [ message, setMessage ] = useState('');
    let data;

    const firestore = getFirestore();

    async function getCollection(db, string) {
        const dataCol = collection(db, string);
        const dataSnapshot = await getDocs(dataCol);
        const dataList = dataSnapshot.docs.map(doc => doc.data());
        return dataList;
    }

    async function saveData(x1, x2, name, id, y1, y2, coll) {
        try {
        await addDoc(collection(firestore, coll), {
            name: name,
            xStart: x1,
            xEnd: x2,
            yStart: y1,
            yEnd: y2,
            url: '',
            id: id
        });
        }
        catch(error) {
        console.error('Error writing new message to Firebase Database', error);
        }
    }

    //database.forEach((item) => {
    //  saveData(item.xStart, item.xEnd, item.name, item.id, item.yStart, item.yEnd, 'maps/map1/characters')
    //})

    useEffect(() => {
        data = getCollection(firestore, `maps/map${game}/characters`);
    }, []);

    useEffect(() => {
        if (data.length === 0 ) return;
        if (data.length === undefined) {
            Promise.resolve(data).then((val) =>{
                data = val;
                fillRandom();
            })
        }  
    }, [data])

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

    const getOffset = (target) =>{
        let bodyRect = document.body.getBoundingClientRect();
        let elemRect = target.getBoundingClientRect();
        let top   = elemRect.top - bodyRect.top;
        let left = elemRect.left - bodyRect.left;
        return {top: top, left: left}
    }

    const fillRandom = () => {
        console.log(data);
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
                let result = isBetweenBoundaries(aux[i])
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
        if (char.xStart <= coords.left && char.xEnd >= coords.left &&
            char.yStart <= coords.top && char.yEnd >= coords.top)
        return true;
        else return false;
    }

    const startGame = () => {
        setStart(true);
        setTimer(setInterval(() => {
            let newTime = clock;
            newTime.setSeconds(newTime.getSeconds() + 1);
            setClock(new Date(newTime));
        }, 1000))
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
            <img onClick={onClick} src={Image} alt='simpsons'></img>
            <div id='modal' style={{top: coords.top - 40, left: coords.left - 40}}>
                <div id='circle'></div>
                <div id='picker'>
                    {(random.length > 0) ? random.map ((char) => (char.found === false) ?
                    <button key={char.id} onClick={() => checkFound(char.id)} className='choice'>{char.name}</button> :
                    '') : ''}
                </div>
            </div>
            {(random.length > 0) ? 
            random.map (char => <div key={char.id} className='found circle' style={(char.found === true) ? {top:char.yStart, left: char.xStart} : {top: -1000, left: -1000}}></div>) 
            : ''}
        </div>
        {(over === true) ? 
            <div id='over'>
                <h3>Your Score:</h3>
                <h1>{clock.toTimeString().substring(0, 9)}</h1>
                <div className='buttons'>
                    <button>Cancel</button>
                    <button>Submit</button>
                </div>
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
        <div id='preview' style={{backgroundImage: `url(${Image})` }}>
            <button onClick={startGame}>Ready?</button>
        </div>
    )
}

export default Game;


  


