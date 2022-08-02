import { useEffect, useState } from 'react';
import Image from './simpsons.jpg';
import database from './database';

function Game() {

    const [ coords, setCoords ] = useState({top: -100, left: -100})
    const [ data, setData ] = useState(database);
    const [ random, setRandom ] = useState([]);

    useEffect(() => {
        fillRandom();
    }, []);

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
                if (result === true) {//message logic
                }
            }
        }
        setCoords({top: -100, left: -100})
        setRandom(aux);
    }

    const isBetweenBoundaries = (char) => {
        if (char.xStart <= coords.left && char.xEnd >= coords.left &&
            char.yStart <= coords.top && char.yEnd >= coords.top)
        return true;
        else return false;
    }

    
    return (
      <div id='game-container'>
        <div id='game-ui'></div>
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
        random.map (char => <div key={char.id} className='found' style={(char.found === true) ? {top:char.yStart, left: char.xStart} : {top: -100, left: -100}}></div>) 
        : ''}
      </div>
      </div>
    );
}

export default Game;


  


