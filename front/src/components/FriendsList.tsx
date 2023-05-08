import React, { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/router';
import axios, { AxiosError, AxiosResponse } from 'axios';
import defaultAvatar from '../assets/60111.jpg';
import Image from 'next/image';
// Icons
import {
  AiOutlineMessage,
  AiOutlineUserAdd,
  AiOutlineUserDelete,
} from 'react-icons/ai';
import { MdOutlinePersonRemoveAlt1 } from 'react-icons/md';
import { BiBlock } from 'react-icons/bi';
import { GiSandsOfTime } from 'react-icons/gi';
import { FaCircle } from 'react-icons/fa';
import {
  handleInvite,
  handleAccept,
  handleReject,
  handleRemove,
  handleCancel,
  handleBlock,
  handleUnblock,
} from '../Utils/buttonHandlers';

// {
//   "uuid": "1219acbc-cfcf-4e74-9d9c-0ce7a24cad6b",
//   "firstName": "Bounri",
//   "lastName": "Othmane",
//   "username": "obounri",
//   "email": "obounri@student.1337.ma",
//   "gamesCount": 0,
//   "wins": 0,
//   "score": 0,
//   "status": "offline",
//   "avatar": "https://cdn.intra.42.fr/users/7b8abaa0fe0a1eed391d7238909ae0cb/obounri.jpg",
//   "_2fa": false,
//   "firstLogin": false,
//   "t_joined": "2023-03-23T19:48:56.064Z"
// }

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

const listStatus = ['All', 'Online', 'Invitations', 'Blocked'];

const FriendsList = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('All');
  const [friends, setFriends] = useState<FriendsArray>([]);

  const fetchAll = async () => {
    const res = await axios.get('http://localhost:3300/friends', {
      withCredentials: true,
    });
    console.log('All res.data');
    console.log(res.data);
    setFriends(res.data);
  };

  const fetchOnline = async () => {
    const res = await axios.get('http://localhost:3300/friends', {
      withCredentials: true,
    });
    console.log('Online res.data');
    console.log(res.data);
    setFriends(res.data.filter((friend: Friend) => friend.status === 'online'));
  };

  const fetchPending = async () => {
    const res = await axios.get('http://localhost:3300/friends/pending', {
      withCredentials: true,
    });
    console.log('Pending res.data');
    console.log(res.data);
    setFriends(res.data);
  };

  const fetchBlocked = async () => {
    const res = await axios.get('http://localhost:3300/friends/blocked', {
      withCredentials: true,
    });
    console.log('Blocked res.data');
    console.log(res.data);
    setFriends(res.data);
  };

  // const [buttons,setButtons] = useState<>();

  useEffect(() => {}, [friends]);
  useEffect(() => {
    switch (selected) {
      case 'All':
        fetchAll();
        break;
      case 'Online':
        fetchOnline();
        break;
      case 'Invitations':
        fetchPending();
        break;
      case 'Blocked':
        fetchBlocked();
        break;
      default:
        return;
    }
  }, [selected]);
  const accept = async (uuid: string | undefined) => {
    const acceptRes = await handleAccept(uuid);
    console.log('acceptRes');
    console.log(acceptRes);
    if (acceptRes === true)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
    // await fetchPending();
  };
  const invite = async (uuid: string) => {
    const res = await handleInvite(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };

  const reject = async (uuid: string) => {
    const res = await handleReject(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };

  const remove = async (uuid: string) => {
    const res = await handleRemove(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };

  const cancel = async (uuid: string) => {
    const res = await handleCancel(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };

  const block = async (uuid: string) => {
    const res = await handleBlock(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };
  const unblock = async (uuid: string) => {
    const res = await handleUnblock(uuid);
    if (res)
      setFriends(
        friends.filter((friend) => {
          friend.uuid !== uuid;
        })
      );
  };

  return (
    <div
      style={{
        backgroundImage:
          'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.5),hsla(276, 31%, 54%, 0.5),hsla(265, 32%, 53%, 0.5),hsla(253, 32%, 51%, 0.5),  hsla(241, 32%, 50%, 0.5))',
      }}
      className='bg-btn-dark-color lg:col-span-3 text-xl w-full flex mx-auto py-4  px-8 border shadow-lg border-solid border-white border-opacity-60 rounded-xl text-white items-center justify-between font-neuePixel flex-col'
    >
      <h1 className='m-0 my-4'>Friends</h1>
      <div className='w-full flex gap-4 text-3xl'>
        {listStatus.map((status) => {
          return (
            // ALL , ONLINCE , INVITATIONS , BLOCKED
            <h6
              key={status}
              className={`m-0 cursor-pointer px-2 rounded-lg shadow-sm ${
                selected === status
                  ? 'bg-violet-300 cursor-default'
                  : 'hover:opacity-60 hover:bg-violet-300'
              }`}
              onClick={() => {
                console.log(`setting status to ${status}`);
                setSelected(status);
              }}
            >
              {status}
            </h6>
          );
        })}
      </div>
      <div className='w-full mt-2'>
        <ul className='list-none m-0 p-0 '>
          {friends.map((friend) => {
            return (
              <li
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
                }}
                key={friend.uuid}
                className="group transition-all ease-in-out delay-150 hover:bg-white   hover:scale-[1.01] bg-gray-400 flex my-1 p-2 border border-solid border-white border-opacity-60 rounded-lg shadow-lg  items-center gap-4"
              >
                {' '}
                {/* <div className=""> */}
                <Image
                  src={
                    friend.avatarUrl === "defaultAvatar"
                      ? defaultAvatar
                      : friend.avatarUrl
                  }
                  alt={"User Avatar"}
                  width={40}
                  height={40}
                  className={`rounded-full shadow-md`}
                ></Image>
                {
                  // ((selected === 'All' || selected === 'Online') && friend.status === 'online') &&
                  // (<div className="h-10 absolute -bottom-2 right-1.5">
                  //   <FaCircle className="text-green-500 text-xs" />
                  // </div>)
                }
                {/* </div> */}
                <p
                  className="m-0 cursor-pointer group-hover:text-indigo-800 hover:scale-110"
                  onClick={() => {
                    router.push(`/profile/${friend.uuid}`);
                  }}
                >
                  {friend.username}
                </p>
                <div className="ml-auto">
                  {(selected === "All" || selected === "Online") && (
                    <>
                      <div className='grid grid-cols-3 lg:grid-cols-3 gap-2'>
                        <button
                          type='button'
                          style={{
                            backgroundImage:
                              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
                          }}
                          className={` border border-white border-opacity-60 shadow-lg flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 font-neuePixel rounded-lg hover:bg-opacity-60 hover:bg-violet-600  font-bold text-gray-200`}
                        >
                          <AiOutlineMessage />
                          <p className='m-0 hidden  lg:inline'>Chat</p>
                        </button>
                        <button
                          type='button'
                          style={{
                            backgroundImage:
                              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
                          }}
                          className={` border border-white border-opacity-60 shadow-lg flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 font-neuePixel rounded-lg hover:bg-red-700  bg-red-600 font-bold text-gray-200`}
                          onClick={() => remove(friend.uuid)}
                        >
                          <MdOutlinePersonRemoveAlt1 />
                          <p className='m-0 hidden lg:inline'>Remove</p>
                        </button>
                        <a
                          className={`border border-white border-opacity-60 shadow-lg flex justify-center items-center gap-1 cursor-pointer font-neuePixel rounded-lg  hover:text-gray-900 text-amber-800`}
                          onClick={() => block(friend.uuid)}
                        >
                          <BiBlock />
                          <p className='m-0 hidden lg:inline'>Block</p>
                        </a>
                      </div>
                    </>
                  )}
                  {selected === 'Invitations' && (
                    <>
                      <div className='grid grid-cols-2 lg:grid-cols-2 gap-2'>
                        <button
                          type='button'
                          style={{
                            backgroundImage:
                              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
                          }}
                          className={`border border-white border-opacity-60 shadow-lg flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 font-neuePixel rounded-lg hover:bg-opacity-60 hover:bg-violet-600  font-bold text-gray-200`}
                          onClick={() => accept(friend.uuid)}
                        >
                          <AiOutlineUserAdd />
                          <p className='m-0 hidden  md:inline'>Accept</p>
                        </button>
                        <button
                          type='button'
                          style={{
                            backgroundImage:
                              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
                          }}
                          className={`border border-white border-opacity-60 shadow-lg flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 font-neuePixel rounded-lg hover:bg-red-700  bg-red-600 font-bold text-gray-200`}
                          onClick={() => reject(friend.uuid)}
                        >
                          <AiOutlineUserDelete />
                          <p className='m-0 hidden  md:inline'>Reject</p>
                        </button>
                      </div>
                    </>
                  )}
                  {selected === 'Blocked' && (
                    <>
                      <a
                        className={`mx-2 flex justify-center items-center gap-1 cursor-pointer border-0 font-neuePixel rounded-lg  hover:text-gray-900 text-amber-900 `}
                        onClick={() => unblock(friend.uuid)}
                      >
                        <BiBlock />
                        <p className='m-0'>Unblock</p>
                      </a>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {friends.length == 0 && (
          <div className='flex justify-center items-center text-center'>
            <h2 className='m-8 font-classic text-gray-800 text-2xl'>
              No one is here
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
