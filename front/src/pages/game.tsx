import styles from '@/styles/Game.module.css';
import PongGame from '../components/Pong';
import GeneralLayout from '../components/GeneralLayout';
import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineColorSwatch } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { GiBattleGear } from 'react-icons/gi';
import { SiRiotgames } from 'react-icons/si';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/auth';
import Loading from '../components/Loading';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
};

interface ThemesListProps {
  themeState: [
    theme: string,
    setTheme: React.Dispatch<React.SetStateAction<string>>
  ];
  display: boolean;
}

const ThemesList = ({ themeState, display }: ThemesListProps) => {
  const [theme, setTheme] = themeState;
  const [themesListDisplay, setThemesListDisplay] = useState<boolean>(false);

  const toggleThemesList = () => {
    setThemesListDisplay(!themesListDisplay);
  };

  return (
    <div className={styles.themes}>
      <button
        className={styles.btn}
        id={styles.displaybtn}
        onClick={toggleThemesList}
        disabled={display}
      >
        <HiOutlineColorSwatch />
        <div className={styles.title}>Themes</div>
      </button>
      <div style={{ display: display ? 'none' : 'block' }}>
        <ul className={themesListDisplay ? styles.list : styles.nolist}>
          <li>
            <button
              className={styles.btn}
              id={
                theme === 'game-board' ? styles.classicSelected : styles.classic
              }
              onClick={() => setTheme('game-board')}
            >
              Classic
            </button>
          </li>
          <li>
            <button
              className={styles.btn}
              id={
                theme === 'game-board-theme-0'
                  ? styles.fantasySelected
                  : styles.fantasy
              }
              onClick={() => setTheme('game-board-theme-0')}
            >
              Fantasy
            </button>
          </li>
          <li>
            <button
              className={styles.btn}
              id={
                theme === 'game-board-theme-1'
                  ? styles.arcadeSelected
                  : styles.arcade
              }
              onClick={() => setTheme('game-board-theme-1')}
            >
              Arcade
            </button>
          </li>
          <li>
            <button
              className={styles.btn}
              id={
                theme === 'game-board-theme-2'
                  ? styles.matriaxSelected
                  : styles.matriax
              }
              onClick={() => setTheme('game-board-theme-2')}
            >
              Matriax
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

interface GameOptionsProps {
  gameOption: number;
  setGameOptions: (vl: number) => void;
}

const GameOptions = ({ gameOption, setGameOptions }: GameOptionsProps) => {
  return (
    <div className={styles.game_options}>
      <button
        className={gameOption === 1 ? styles.selected : styles.queue}
        onClick={() => setGameOptions(1)}
      >
        <GiBattleGear
          style={{ marginRight: '1rem', color: '#fff', fontSize: '2.2rem' }}
        />
        <span>Join The Queue</span>
      </button>
      <button
        className={gameOption === 2 ? styles.selected : styles.vs_friend}
        onClick={() => setGameOptions(2)}
      >
        <SiRiotgames
          style={{ marginRight: '1rem', color: '#fff', fontSize: '2.2rem' }}
        />
        <span>Play V.S Friend</span>
      </button>
    </div>
  );
};

const useSocket = () => {
  // Socket Connection
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = () =>
      io('http://localhost:3300', {
        withCredentials: true,
        transports: ['websocket'],
        //  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImNqIiwiYXZhdGFyIjoiaHR0cHM6Ly9jZG4uaW50cmEuNDIuZnIvdXNlcnMvN2I4YWJhYTBmZTBhMWVlZDM5MWQ3MjM4OTA5YWUwY2Ivb2JvdW5yaS5qcGciLCJlbWFpbCI6Im9ib3VucmlAc3R1ZGVudC4xMzM3Lm1hIiwiXzJmYSI6dHJ1ZX0sImlhdCI6MTY3OTE3NzI5NiwiZXhwIjoxNjc5MjYzNjk2fQ.z0DL81O_XnwcN1IvjWqbABsamHOQnXOwoNFIaR9xfUs' }
      });

    setSocket(newSocket);

    return () => {
      socket?.disconnect();
    };
  }, []);

  return socket;
};

export default function Play() {
  console.log('Play render');
  const { user, socket } = useAuth();
  const windowSize = useWindowSize();
  const [stateVar, setStateVar] = useState<{ width: number; height: number }>(
    windowSize
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>('');
  const [gameOption, setGameOptions] = useState<number>(0);
  const [socketId, setSocketId] = useState<string>('');
  const [cancelQueue, setCancelQueue] = useState<boolean>(false);
  const [startGame, setStartGame] = useState<boolean>(false);

  // const socket = useSocket();;
  console.log('my Socket Id');
  console.log(socket?.id);
  const displayGame = gameOption && theme.length !== 0;

  const handleSizeChange = useCallback(() => {
    console.log('--------- UseCallback ');
    setStateVar(windowSize);
  }, [windowSize]);

  useEffect(() => {
    console.log('--------->>>> UseEffect lets Play ');
    socket?.on('letsPlay', () => {
      setStartGame(true);
    });
  });

  useEffect(() => {
    console.log('++++++++++++++ UseEffect HandleSize');

    handleSizeChange();
    if (windowSize.height > 0 || windowSize.width > 0) {
      setLoading(false);
    } else if (windowSize.height === 0 && windowSize.width === 0) {
      setLoading(true);
    }
  }, [handleSizeChange, windowSize]);

  useEffect(() => {
    console.log('************* UseEffect socket and CanelQueue');
    if (socket && cancelQueue) {
      socket.emit('CancelQueue');
    }
    setCancelQueue(false);
    setGameOptions(0);
    setStartGame(false);
    setTheme('');
  }, [cancelQueue, socket]);

  // Game Mode
  useEffect(() => {
    console.log('--------- UseEffect Hadnle Game Options');
    if (socket) {
      if (gameOption === 1 && theme) {
        socket.emit('JoinQueue', { data: 'lets Join Queue' });
      } else if (gameOption === 2 && theme) {
        socket.emit('PlayVsFriend', { data: 'Vs My Friend' });
      }
      setSocketId(socket.id);
    }
  }, [socket, gameOption, theme]);

  // console.log (displayGame);

  return (
    <>
      {loading ? (
        <Loading title={'Loading...'} display={false} />
      ) : displayGame && gameOption === 1 && !cancelQueue && !startGame ? (
        <Loading
          title='Looking for match...'
          display={true}
          setCancelQueue={setCancelQueue}
        />
      ) : (
        <GeneralLayout
          title={'Profile'}
          link={'/profile'}
          searchbarDisplay={false}
          pageName={'Play'}
          description={'Classic Pong Game'}
          keywords={''}
        >
          <div className={styles.board}>
            {!displayGame && (
              <GameOptions
                gameOption={gameOption}
                setGameOptions={setGameOptions}
              />
            )}

            {!displayGame && (
              <ThemesList
                display={gameOption !== 0 ? false : false}
                themeState={[theme, setTheme]}
              />
            )}

            {/* {displayGame && gameOption === 1 ? <Loading title='Looking for Match...' display={true}/> : ''} */}
            {startGame ? (
              <PongGame
                windowHeightSize={stateVar.height}
                windowWidthSize={stateVar.width}
                theme={theme}
              />
            ) : (
              ''
            )}
          </div>
        </GeneralLayout>
      )}
    </>
  );
}
