interface Friend {
  uuid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gamesCount: number;
  wins: number;
  score: number;
  status: string;
  avatarUrl: string;
  _2fa: boolean;
  firstLogin: boolean;
  t_joined: string;
}

type FriendsArray = Friend[];

export let FriendsDummyArray: FriendsArray = [
  {
    uuid: "1",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "johndoe@example.com",
    gamesCount: 20,
    wins: 10,
    score: 500,
    status: "online",
    avatarUrl: "defaultAvatar",
    _2fa: true,
    firstLogin: false,
    t_joined: "2022-01-01T00:00:00.000Z",
  },
  {
    uuid: "2",
    firstName: "Jane",
    lastName: "Doe",
    username: "janedoe",
    email: "janedoe@example.com",
    gamesCount: 15,
    wins: 5,
    score: 250,
    status: "offline",
    avatarUrl: "defaultAvatar",
    _2fa: false,
    firstLogin: true,
    t_joined: "2022-01-02T00:00:00.000Z",
  },
  {
    uuid: "3",
    firstName: "Bob",
    lastName: "Smith",
    username: "bobsmith",
    email: "bobsmith@example.com",
    gamesCount: 30,
    wins: 20,
    score: 800,
    status: "online",
    avatarUrl: "defaultAvatar",
    _2fa: false,
    firstLogin: false,
    t_joined: "2022-01-03T00:00:00.000Z",
  },
  {
    uuid: "4",
    firstName: "Alice",
    lastName: "Jones",
    username: "alicejones",
    email: "alicejones@example.com",
    gamesCount: 10,
    wins: 2,
    score: 100,
    status: "offline",
    avatarUrl: "defaultAvatar",
    _2fa: true,
    firstLogin: true,
    t_joined: "2022-01-04T00:00:00.000Z",
  },
  {
    uuid: "5",
    firstName: "Tom",
    lastName: "Wilson",
    username: "tomwilson",
    email: "tomwilson@example.com",
    gamesCount: 25,
    wins: 15,
    score: 600,
    status: "online",
    avatarUrl: "defaultAvatar",
    _2fa: true,
    firstLogin: false,
    t_joined: "2022-01-05T00:00:00.000Z",
  },
  {
    uuid: "6",
    firstName: "Emily",
    lastName: "Brown",
    username: "emilybrown",
    email: "emilybrown@example.com",
    gamesCount: 5,
    wins: 1,
    score: 50,
    status: "offline",
    avatarUrl: "defaultAvatar",
    _2fa: false,
    firstLogin: true,
    t_joined: "2022-01-06T00:00:00.000Z",
  }
];

// export default FriendsDummyArray;