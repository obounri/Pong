import { 
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { UserDecorator } from 'src/user/user.decorater';
import { WsJwtGuard } from 'src/jwt/jwt-ws.guard';
import { JwtAuthService } from 'src/jwt/jwt-auth.service';
import { GameService } from './game.service';
import { UserDto } from 'src/user/entities/user.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UserService } from 'src/user/user.service';
import { UserStatus } from 'src/user/entities/user.entity';

const BALL_SPEED_FACTOR = 120;
const PADDLE_SPEED_FACTOR = 90;

const FACTORX = 0.75;
const FACTORY = 0.6;
const BALL_FACTOR = 0.03;
const PADDLE_HEIGHT_FACTOR = 0.12;
const PADDLE_WIDTH_FACTOR = 0.01;

interface WindowSizeProp {
    height: number;
    width: number;
};

interface GameStateProp {
  firstUser: ConnectedUser;
  secondUser: ConnectedUser;
  start: boolean;
};
  
  
  interface ConnectedUser {
    userId: string;
    socketId: string;
    windowSize?: WindowSizeProp;
    rightPaddle?: number;
    leftPaddle?: number;
    score?: number;
    ballPosition?: {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
  };
};



interface HandlerProps {
  prevPaddlePosition: number;
  direction: boolean;
  BoardHeight: number;
};


@WebSocketGateway()
export class GameGateway 
implements OnGatewayConnection, OnGatewayDisconnect
{
  private connected: ConnectedUser[] = [];
  private queue : ConnectedUser[] = [];
  private inGame: GameStateProp[] = [];
  constructor(
    private readonly gameService: GameService,
    private jwtService: JwtAuthService,
    private readonly userService: UserService
  ) {
    
  }
  
  @WebSocketServer()
  server: Server;

  // Handle WebSocket connections
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // get user id by jwt token
    try { 
      const userId = await this.getUserIdFromSocket(socket);
      if (userId){
        this.addConnectedUser({userId, socketId: socket.id});
        try {
          this.userService.update(userId, { status: UserStatus.online});

        }catch (err){
          console.log(err);
        }
      }

    } catch(err) {
      console.log (err);
    }
  }
  
  
  // Handle WebSocket disconnections
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId = await this.getUserIdFromSocket(socket);
    if (userId){
      this.removeConnectedUser({userId, socketId: socket.id});
      this.removeUserFromQueue(userId);
      try{
        this.userService.update(userId, { status: UserStatus.offline});
      } catch(err){
        console.log (err);
      }
      this.quitGame(userId, socket.id);      

    }
    
  }

  // Add User to Game Queue
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('JoinQueue')
  async handleJoinQueue(@MessageBody() data: any,@UserDecorator() user: {user: UserDto}, @ConnectedSocket() socket: Socket) {

    if (user.user.uuid){
      const addToQueue = this.addUserToQueue(user.user.uuid, socket.id);
      if (addToQueue){
        this.sendOk(this.queue[0].socketId, this.queue[1].socketId, this.queue[0].userId, this.queue[1].userId);
        this.usersInGame(this.queue[0].userId, this.queue[1].userId);
        this.removeUserFromQueue(this.queue[0].userId);
        this.removeUserFromQueue(this.queue[0].userId);
      }
    }
    
  };
  
  // Cancel Queue Match
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('CancelQueue')
  async CancelQueue(@ConnectedSocket() socket: Socket, @UserDecorator() user: {user: UserDto}) {
    if (user.user.uuid){
      this.removeUserFromQueue(user.user.uuid);
    }
  };

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('windowSize')
  async WindowSizeHandle(@ConnectedSocket() socket: Socket, @UserDecorator() user: {user: UserDto}, @MessageBody() data: WindowSizeProp) {
    if (this.inGame.length)
      this.addWindowSize(socket.id, data, user.user.uuid);
  };
  
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('PaddleChange')
  async PaddleHandler(@ConnectedSocket() socket: Socket, @UserDecorator() user: {user: UserDto}, @MessageBody() direction: boolean){
    this.handleGameState(user.user.uuid, socket.id, direction);
  };



  
  //************************************************** *//
  
  
  private handleGameState(userId: string, socketId: string, direction: boolean){
    
    const BoardHeight = (windowHeightSize: number) => (windowHeightSize * FACTORY) - (windowHeightSize * PADDLE_HEIGHT_FACTOR);
    
    this.inGame.forEach((gameState) => {
      if (gameState.firstUser.socketId === socketId && gameState.firstUser.userId === userId){

        const prevrPaddlePosition = gameState.firstUser.rightPaddle;
        const prevlPaddlePosition = gameState.secondUser.rightPaddle;
        const newrPosition  = this.handlePaddlePosition(prevrPaddlePosition, direction, BoardHeight(gameState.firstUser.windowSize.height));
        const newlPosition  = this.handlePaddlePosition(prevlPaddlePosition, direction, BoardHeight(gameState.secondUser.windowSize.height));
        gameState.firstUser.rightPaddle = newrPosition;
        gameState.secondUser.rightPaddle = newlPosition;
        
        // 
        this.server.to(gameState.firstUser.socketId).emit('GameState', gameState);
        this.server.to(gameState.secondUser.socketId).emit('GameState', gameState);
      }
      if (gameState.secondUser.socketId === socketId && gameState.secondUser.userId === userId){
        const prevrPaddlePosition = gameState.secondUser.leftPaddle;
        const prevlPaddlePosition = gameState.firstUser.leftPaddle;
        const newrPosition  = this.handlePaddlePosition(prevrPaddlePosition, direction, BoardHeight(gameState.secondUser.windowSize.height));
        const newlPosition  = this.handlePaddlePosition(prevlPaddlePosition, direction, BoardHeight(gameState.firstUser.windowSize.height));
        gameState.secondUser.leftPaddle = newrPosition;
        gameState.firstUser.leftPaddle = newlPosition;
        this.server.to(gameState.firstUser.socketId).emit('GameState', gameState);
        this.server.to(gameState.secondUser.socketId).emit('GameState', gameState);
      }
    });
  }





  private quitGame(userId: string, socketId: string) {

    this.inGame.forEach((gameState, gameIndex) => {
      const winner = gameState.firstUser.score === 3 ? {x: false, y: true} : (gameState.secondUser.score === 3) ? {x: true, y: false} : {x: false, y: true};
      if (gameState.firstUser.socketId === socketId && gameState.firstUser.userId === userId){
        this.server.to(gameState.secondUser.socketId).emit('YouWin', {y: gameState.firstUser.score , x: gameState.secondUser.score, winner: winner, message: 'Opponent Disconnection', start:false});
        this.inGame.splice(gameIndex, 1);
      }
      if (gameState.secondUser.socketId === socketId && gameState.secondUser.userId === userId){
        // const winner = gameState.secondUser.score === 3 ? {x: false, y: true} : (gameState.firstUser.score === 3) ? {x: true, y: false} : {x: true, y: false};
        this.server.to(gameState.firstUser.socketId).emit('YouWin', {x: gameState.firstUser.score , y: gameState.secondUser.score , winner: winner, message: 'Opponent Disconnection', start: false});
        this.inGame.splice(gameIndex, 1);
      }
    });

  };



  private addWindowSize(socketId: string, windowSize: WindowSizeProp, userId: string){
    console.log (`socketId: ${socketId} window size: `);
    console.log (windowSize);

    this.inGame.forEach((game) =>{
      // 
      const paddleInit = ((windowSize.height * FACTORY)/2 - (windowSize.height * PADDLE_HEIGHT_FACTOR) /2);
      if (game.secondUser.userId === userId && game.secondUser.socketId === socketId){
        game.secondUser.windowSize = windowSize;
        game.secondUser.rightPaddle = paddleInit;
        game.secondUser.leftPaddle = paddleInit;
        game.secondUser.ballPosition = this.ballInit(windowSize);
        this.server.to(game.secondUser.socketId).emit('InitPaddlePosition', game.secondUser);
        this.handleBall(game);
      }
      // 
      if (game.firstUser.userId === userId && game.firstUser.socketId === socketId){
        game.firstUser.windowSize = windowSize;
        game.firstUser.rightPaddle = paddleInit;
        game.firstUser.leftPaddle = paddleInit;
        game.firstUser.ballPosition = this.ballInit(windowSize);
        this.server.to(game.firstUser.socketId).emit('InitPaddlePosition', game.firstUser);
        this.handleBall(game);
      }
    });
  };

  
  handleBall(gameState: GameStateProp) {
    setInterval(() => {

      if (gameState?.start && gameState){
          const randomNumber = Math.random();
          const newballPosition = this.HandleBallPosition(gameState, gameState.firstUser, gameState.secondUser, randomNumber);
          const newLballPosition = this.HandleBallPosition(gameState, gameState.secondUser, gameState.firstUser, randomNumber);
          gameState.firstUser.ballPosition = newballPosition;
          gameState.secondUser.ballPosition = newLballPosition;
          this.server.to(gameState.firstUser.socketId).emit('GameState', gameState);
          this.server.to(gameState.secondUser.socketId).emit('GameState', gameState);
      }
    }, 300);
  }
      
    
    // Init ball position
  private ballInit(windowSize: WindowSizeProp) {
    return {
      x: windowSize.width * FACTORX / 2 - windowSize.height * BALL_FACTOR /2,
      y: windowSize.height * FACTORY / 2 - windowSize.height * BALL_FACTOR /2,
      speedX: (windowSize.width / BALL_SPEED_FACTOR) + 1,
      speedY: (windowSize.height / BALL_SPEED_FACTOR) + 1
    };
  };



  private usersInGame(userId1: string, userId2: string) {
    const inGameUsers = this.queue.filter((user) => user.userId === userId1 || user.userId === userId2);
   
    const game: GameStateProp = {
      secondUser: inGameUsers[0],
      firstUser: inGameUsers[1],
      start: false

    };
    game.start = false;
    game.firstUser.score = 0;
    game.secondUser.score = 0;
    this.inGame.push(game);
   
    // timer for game start
    const length = this.inGame.length;
    setTimeout(() => {
      this.inGame[length - 1].start = true;
      this.server.to(this.inGame[length - 1].firstUser.socketId).emit('start', this.inGame[length - 1])
      this.server.to(this.inGame[length - 1].secondUser.socketId).emit('start', this.inGame[length - 1]);
    }, 1000);
  };



  private sendOk(socketId1: string, socketId2: string, userId1: string, userId2: string){
    try {
      this.userService.update(userId1, { status: UserStatus.inGame});
      this.userService.update(userId2, { status: UserStatus.inGame});
    }catch (err) {
      console.log (err);
    };
    this.server.to(socketId1).emit(`letsPlay`, {
      data: this.queue[1].socketId,
      queue: false
    });
    this.server.timeout(5000).to(socketId2).emit(`letsPlay`, {
      data: this.queue[0].socketId,
      queue: false
    });

  }



  private async getUserIdFromSocket(socket: Socket): Promise<string | undefined> {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      ?.find((cookie: string) => cookie.includes('jwt='))
      ?.split('=')[1];
    if (token) {
      const payload = this.jwtService.verify(token).user;
      if (payload) {
        return payload.uuid;
      }
    }
    return undefined;
  };



  private addConnectedUser({userId ,socketId}: ConnectedUser): void {
    const existingUserIndex = this.connected.findIndex((connectedUser) => connectedUser.userId === userId);
    if (existingUserIndex !== -1){
      this.connected[existingUserIndex].socketId = socketId;
    }else{
      this.connected.push({userId, socketId});
    }
  };



  private removeConnectedUser({userId, socketId}: ConnectedUser): void {
    const index = this.connected.findIndex(
      (connectedUser) => connectedUser.userId === userId && connectedUser.socketId === socketId
    );

    if (index !== -1){
      this.connected.splice(index, 1);
    }
  };
  


  private addUserToQueue (userId: string, socketId: string): boolean {
    const match = this.queue.find((currentUser) => currentUser.userId === userId);
    if (!match){
      this.queue.push({userId, socketId});
    }
    return (this.queue.length % 2 === 0 || this.queue.length > 2);
  };
  
  

  private removeUserFromQueue (userId: string): void {
      const index = this.queue.findIndex(
        (currentUser) => currentUser.userId === userId
      );
      if (index !== -1){
        this.queue.splice(index, 1);
      }
  };

  //********************** Paddle Postions Handler ************************* *//
  
  private handlePaddlePosition = (prevPaddlePosition: number, direction: boolean, BoardHeight: number) => {
    const newPosition = direction ? prevPaddlePosition - (BoardHeight / PADDLE_SPEED_FACTOR) : prevPaddlePosition + (BoardHeight / PADDLE_SPEED_FACTOR);

    const topPaddlePosition = newPosition > BoardHeight ? (BoardHeight - prevPaddlePosition)  + prevPaddlePosition : 0;
    const bottomPaddlePosition = newPosition < 0 ? (0 - prevPaddlePosition) + prevPaddlePosition : 0;

    return (
        newPosition < 0 ? 
        (bottomPaddlePosition === 0 ? bottomPaddlePosition : prevPaddlePosition) :
        (newPosition > BoardHeight ? (topPaddlePosition === BoardHeight ? topPaddlePosition : prevPaddlePosition) : newPosition)
    );
  };



  //********************************************************** *//


  private HandleBallPosition(gameState: GameStateProp, firstUser: ConnectedUser, secondUser: ConnectedUser, randomNumber: number) {
    const newBallPosition: {x: number, y: number, speedX: number, speedY:number} = {
        x: firstUser.ballPosition.x + firstUser.ballPosition.speedX,
        y: firstUser.ballPosition.y + firstUser.ballPosition.speedY,
        speedX: firstUser.ballPosition.speedX,
        speedY: firstUser.ballPosition.speedY
    };


      // check if the ball has collided with a paddle, and if so, change its direction and speed
      if (
          (newBallPosition.speedX > 0 && newBallPosition.x + (firstUser.windowSize.height * BALL_FACTOR) >= (firstUser.windowSize.width * FACTORX) - (firstUser.windowSize.width * PADDLE_WIDTH_FACTOR) &&
              newBallPosition.y + (firstUser.windowSize.height * BALL_FACTOR) >= firstUser.rightPaddle && newBallPosition.y <= firstUser.rightPaddle + (firstUser.windowSize.height * PADDLE_HEIGHT_FACTOR)) ||
        (newBallPosition.speedX < 0 && newBallPosition.x <= (firstUser.windowSize.width * PADDLE_WIDTH_FACTOR) &&
          newBallPosition.y + (firstUser.windowSize.height * BALL_FACTOR) >= firstUser.leftPaddle && newBallPosition.y <= firstUser.leftPaddle + (firstUser.windowSize.height * PADDLE_HEIGHT_FACTOR))
      ) {
          newBallPosition.speedX = -newBallPosition.speedX;
          newBallPosition.speedY += (randomNumber - 0.5) * 10;
      }
      
      // check if the ball has collided with the top or bottom of the game board, and if so, change its direction and speed
      if (newBallPosition.y - 4 <= 0 || newBallPosition.y + (firstUser.windowSize.height * BALL_FACTOR) + 4 >= (firstUser.windowSize.height * FACTORY)) {
          newBallPosition.speedY = -newBallPosition.speedY;
      }

      // check if the ball has gone out of bounds (i.e., it has passed the left or right edge of the game board), and if so, reset its position and speed
      if (newBallPosition.x <= 0 || newBallPosition.x + (firstUser.windowSize.height * BALL_FACTOR) >= (firstUser.windowSize.width * FACTORX)) {
          // Set the Score to The players
          if (newBallPosition.x <= 0) {
            firstUser.score += 1;
            // init paddle Position
            const firstpaddleInit = ((firstUser.windowSize.height * FACTORY)/2 - (firstUser.windowSize.height * PADDLE_HEIGHT_FACTOR) /2);
            const secondpaddleInit = ((secondUser.windowSize.height * FACTORY)/2 - (secondUser.windowSize.height * PADDLE_HEIGHT_FACTOR) /2);
            firstUser.leftPaddle = firstpaddleInit;
            firstUser.rightPaddle = firstpaddleInit;
            secondUser.leftPaddle = secondpaddleInit;
            secondUser.rightPaddle = secondpaddleInit;
            // init ball position
            firstUser.ballPosition = this.ballInit(firstUser.windowSize);
            secondUser.ballPosition = this.ballInit(secondUser.windowSize);
            // emit gameState
            this.server.to(firstUser.socketId).emit('GameState', gameState);
            this.server.to(secondUser.socketId).emit('GameState', gameState);
          }else{
            secondUser.score += 1;
            // init paddle Position
            const firstpaddleInit = ((firstUser.windowSize.height * FACTORY)/2 - (firstUser.windowSize.height * PADDLE_HEIGHT_FACTOR) /2);
            const secondpaddleInit = ((secondUser.windowSize.height * FACTORY)/2 - (secondUser.windowSize.height * PADDLE_HEIGHT_FACTOR) /2);
            firstUser.leftPaddle = firstpaddleInit;
            firstUser.rightPaddle = firstpaddleInit;
            secondUser.leftPaddle = secondpaddleInit;
            secondUser.rightPaddle = secondpaddleInit;
            // init ball position
            firstUser.ballPosition = this.ballInit(firstUser.windowSize);
            secondUser.ballPosition = this.ballInit(secondUser.windowSize);
            // emit gameState
            this.server.to(firstUser.socketId).emit('GameState', gameState);
            this.server.to(secondUser.socketId).emit('GameState', gameState);
          }


          newBallPosition.x = firstUser.windowSize.width * FACTORX / 2 - firstUser.windowSize.height * BALL_FACTOR / 2;
          newBallPosition.y = firstUser.windowSize.height * FACTORY / 2 - firstUser.windowSize.height * BALL_FACTOR / 2;
          newBallPosition.speedX = (firstUser.windowSize.width / BALL_SPEED_FACTOR) + 1;
          newBallPosition.speedY = (firstUser.windowSize.height / BALL_SPEED_FACTOR) + 1;

          // set the Winner
          gameState.start = (firstUser.score === 3 || secondUser.score === 3) ? false : true;
          if(firstUser.score === 3){
            this.server.to(firstUser.socketId).emit('YouWin', {x:firstUser.score, y: secondUser.score, winner: {x: true, y: false}});
            this.server.to(secondUser.socketId).emit('YouWin', {x:secondUser.score, y: firstUser.score, winner: {x: true, y: false}});
          }
          if(secondUser.score === 3){
            this.server.to(secondUser.socketId).emit('YouWin', {x:secondUser.score, y: firstUser.score, winner: {x: false, y: true}});
            this.server.to(firstUser.socketId).emit('YouWin', {x:firstUser.score, y: secondUser.score, winner: {x: false, y: true}});
          }
          
      }

      return newBallPosition;
  }

  @SubscribeMessage('PlayVsFriend')
  PlayVsFriend(@MessageBody() data: any) {
    console.log(data);
    return data;
  }
}


