import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useRouter } from 'next/router';

export interface IUser {
  uuid: string;
  username: string;
  email: string;
  avatarUrl: string;
  _2fa: boolean;
  gamesCount: number;
  friendship: string;
  firstName: string;
  lastName: string;
  t_joined: string;
  wins: number;
  status: string;
  friends: string;
}

interface IAuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  signOut: () => void;
  setUser: (user: IUser | null) => void;
  socket: Socket | null;
}

const AuthContext = createContext<IAuthContext>({
  isAuthenticated: false,
  user: null,
  signOut: () => {},
  setUser: () => {},
  socket: null,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:3300/user/me', {
        credentials: 'include',
      });

      if (response.status === 200) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data);
      } else if (response.status === 401 && router.pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:3300', {
        withCredentials: true,
        transports: ['websocket'],
        // query: {userId: user?.id}
      });
      setUser((prev) => ({ ...prev, status: 'online' })as IUser);
      setSocket(newSocket);
    }
    return () => {
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const signOut = async () => {
    try {
      const response = await axios.get('http://localhost:3300/auth/logout', {
        withCredentials: true,
      });
      setIsAuthenticated(false);
      setUser(null);
      socket?.disconnect();
    } catch (error) {
      console.error(error);
      throw new Error('Failed to sign out, Forbidden.');
    }
  };

  const contextValue: IAuthContext = useMemo(
    () => ({
      isAuthenticated,
      user,
      signOut,
      setUser,
      socket,
    }),
    [isAuthenticated, user, signOut, socket]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const useAuth = (): IAuthContext => useContext(AuthContext);

export { AuthProvider, useAuth };
