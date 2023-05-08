import styles from '@/styles/Pong.module.css';
import { useState, useEffect, useCallback, useMemo} from 'react';
import {VscDebugRestart} from 'react-icons/vsc'
import {RiPingPongFill} from 'react-icons/ri';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/router';


const BALL_SPEED = 20;
// add PaddleSpeedFactor;

const PADDLE_SPEED = 24;

const FACTORX = 0.75;
const FACTORY = 0.6;
const BALL_FACTOR = 0.03;
const PADDLE_HEIGHT_FACTOR = 0.12;
const PADDLE_WIDTH_FACTOR = 0.01;


interface HandlerProps {
    prevPaddlePosition: number;
    direction: boolean;
    BoardHeight: number;
};

interface BallProps {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
};

interface ScoreProps {
    x: number;
    y: number;
    winner: {
        x: boolean;
        y: boolean;
    }
};

interface PongGameProps {
    windowWidthSize:number;
    windowHeightSize:number;
    theme: string;
}
  

const handlePaddlePosition = ({prevPaddlePosition, direction, BoardHeight}: HandlerProps) => {
    const newPosition = direction ? prevPaddlePosition - PADDLE_SPEED : prevPaddlePosition + PADDLE_SPEED;

    const topPaddlePosition = newPosition > BoardHeight ? (BoardHeight - prevPaddlePosition)  + prevPaddlePosition : 0;
    const bottomPaddlePosition = newPosition < 0 ? (0 - prevPaddlePosition) + prevPaddlePosition : 0;

    return (
        newPosition < 0 ? 
        (bottomPaddlePosition === 0 ? bottomPaddlePosition : prevPaddlePosition) :
        (newPosition > BoardHeight ? (topPaddlePosition === BoardHeight ? topPaddlePosition : prevPaddlePosition) : newPosition)
    );
};





export default function PongGame({windowWidthSize, windowHeightSize, theme}: PongGameProps) {
    const [start, setStart] = useState<boolean>(false);
    const [pause, setPause] = useState<boolean>(false);
    const {socket, user} = useAuth();
    const router = useRouter();
    console.log('socket from Pong')
    console.log(socket?.id)
    
    const paddlePosition = useMemo(() => ((windowHeightSize * FACTORY)/2 - (windowHeightSize * PADDLE_HEIGHT_FACTOR) /2), [windowHeightSize]);
    const ballInit = useMemo(() => {
        return {
            x: windowWidthSize * FACTORX / 2 - windowHeightSize * BALL_FACTOR /2,
            y: windowHeightSize * FACTORY / 2 - windowHeightSize * BALL_FACTOR /2,
            speedX: BALL_SPEED + 1,
            speedY: BALL_SPEED + 1
    };}, [windowWidthSize, windowHeightSize]);

    const [score, setScore] = useState<ScoreProps>({
        x: 0,
        y: 0,
        winner:{
            x: false,
            y: false
        }
    });

    const [ball, setBall] = useState<BallProps>(ballInit);

    
    const [leftPaddlePosition, setLeftPaddlePosition] = useState<number>(0);
    const [rightPaddlePosition, setRightPaddlePosition] = useState<number>(0);
    

    useEffect(() => {
        socket?.on('InitPaddlePosition', (user) => {
            setLeftPaddlePosition(user.leftPaddle);
            setRightPaddlePosition(user.rightPaddle);
            setBall(user.ballPosition);
        });
    });


    //   Handle the Control Start Up Down Pause
    const handleKeyDown = (event: KeyboardEvent) => {
        let prevPaddlePosition: number;
        let direction: boolean;
        const BoardHeight = (windowHeightSize * FACTORY) - (windowHeightSize * PADDLE_HEIGHT_FACTOR);

        const paddlesHandler = (prevPaddlePosition: number, direction: boolean) => {
            const newPaddlePosition = handlePaddlePosition({ prevPaddlePosition, direction, BoardHeight });
            if (newPaddlePosition !== prevPaddlePosition){
                socket?.emit('PaddleChange', direction);
            }
        }
        const deBounce = (paddlesHandler: any, timeout: number) => {
            let timer: any;
            return () => {
                clearTimeout(timer);
                timer = setTimeout(() => {paddlesHandler()}, timeout);
            };
        };
    
        if (event.key === 'ArrowUp' && start){
            direction = true;
            prevPaddlePosition = rightPaddlePosition;
            deBounce(paddlesHandler(prevPaddlePosition, direction), 200);
        }
        else if (event.key === 'ArrowDown' && start){
            direction = false;
            prevPaddlePosition = rightPaddlePosition;
            deBounce(paddlesHandler(prevPaddlePosition, direction), 200);
        }

        
    };

    // Opponent Paddle Change (our left paddle)
    useEffect(() => {
        socket?.on('start', (gameState) => {
            setStart(gameState.start);
        });
    });

    // emit the window size to the server for the pieces dimention
    useEffect(() => {
        const windowSize = {height: windowHeightSize, width: windowWidthSize};
        socket?.emit('windowSize', windowSize);
    }, [windowWidthSize, windowHeightSize, socket]);


    // Listen to the win event
    useEffect(() => {
        socket?.on('YouWin', (data) => {
            // ******* pop up the data.message
            setScore({x: data.x, y: data.y, winner: data.winner});
            setPause(true);
            setLeftPaddlePosition(paddlePosition);
            setRightPaddlePosition(paddlePosition);
        });
    });
   

    // Listne on  the keyboard
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });


    // hanlig ball position
    useEffect(() => {
        if (start){
            
            const interval = setInterval(() => {
                // Update ball position
                const prvBall = ball;
                socket?.on('GameState', (gameState) => {

                    const myinfo = gameState.firstUser.userId === user?.uuid ? gameState.firstUser : gameState.secondUser;
                    const oppnent = gameState.firstUser.userId === user?.uuid ? gameState.secondUser : gameState.firstUser;
                    setRightPaddlePosition(myinfo.rightPaddle);
                    setLeftPaddlePosition(myinfo.leftPaddle);
                    setBall(myinfo.ballPosition);
                    socket.on('YouWin', (data) => {
                        setScore({...score, x: data.x, y: data.y, winner: data.win});
                    })
                });

            }, 100);

            // Cleanup function to clear the interval
            return () => clearInterval(interval);
        }
        return ;
        
    }, [ball,leftPaddlePosition, rightPaddlePosition, score, start, pause]);


    // stying 
    const winner = score.winner?.x ? true : (score.winner?.y ? true: false);
    if (winner){
        setTimeout(() => {
            // router.reload();
        }, 2000);
    }
    const gameBoardStyles = (start && !pause) ? styles[theme] : styles['game-board-pause'];

    return (
        <div className={gameBoardStyles}>
            <div className={styles.score}>
                {score.y} | {score.x}
            </div>
            
            <div className={pause && !winner && start ? styles.pause : ''}></div>
            <div className={!start ? styles.start : ''}>
                <RiPingPongFill display={start ? 'none' : ''}/>
            </div>
            
            <div className={winner ? styles.winner : ''}>
                <div className={styles.winnery}>
                    {score.winner.y ? 'WINNER' : null}
                </div>
                <div className={styles.winnerx}>
                    {score.winner.x ? 'WINNER' : null}
                </div>
            </div>
            
            <div className={styles['left-paddle']} style={{top: leftPaddlePosition}}></div>
            <div className={styles['right-paddle']} style={{top: rightPaddlePosition}}></div>
            <div className={!winner ? styles.ball : ''} style={{top: ball.y + (windowHeightSize * BALL_FACTOR)/2, left: ball.x + (windowHeightSize * BALL_FACTOR)/2}}></div>
        </div>
    );
};