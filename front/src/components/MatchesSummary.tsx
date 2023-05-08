import React from "react";
import axios from 'axios'
import { useEffect , useState} from 'react'

const MatchesSummary = () => {
  const [gamesPlayed,setGamesPlayed] = useState<number>(10);

  const fetchGames = async () => {
    const res = await axios.get('http://localhost:3300/games',
    {
      withCredentials: true
    });
    console.log('res.data');
    console.log(res.data.ngames);
    if (res.data.success === true){
      setGamesPlayed(res.data.data.ngames)
    }
  }
  useEffect(() => {
    fetchGames();
  },[])
  

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h1 className="p-0 text-2xl">Matches Summary</h1>
      <p className="p-0 font-neuePixel">Games Played: {gamesPlayed} </p>
      <p className="p-0 font-neuePixel">Wins: </p>
      <p className="p-0 font-neuePixel">Losses: </p>
    </div>
  );
};

export default MatchesSummary;
