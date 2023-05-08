import React, { useEffect, useState } from 'react';
import { AiOutlineCloseCircle, AiOutlineEye } from 'react-icons/ai';
import { BsChatDots } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { TbSwords } from 'react-icons/tb';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { useRouter } from 'next/router';
import axios from 'axios';

const FriendsBar = () => {
  const [friendsIsOpen, setFriendsIsOpen] = useState(false);
  const [friends, setFriends] = useState<IUser>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchFriends = async () => {
      axios
        .get('http://localhost:3300/friends', {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response.data);
          setFriends(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchFriends();
  }, [friendsIsOpen]);

  const handleClick = (friend: IUser) => {
    setFriendsIsOpen(false);
    router.push(`/profile/${friend.uuid}`);
  };
  const handleChat = (friend: IUser) => {
    router.push(`/chat/${friend.uuid}`);
    setFriendsIsOpen(false);
  };
  const alphabet = Array.from(
    new Set(friends.map((friend) => friend.firstName[0].toUpperCase()))
  ).sort();

  return (
    <>
      <button
        style={{
          backgroundImage:
            'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
        }}
        className={`absolute right-72 top-28 text-white border-0 h-12 px-4 py-2 cursor-pointer rounded-l-full ${
          friendsIsOpen
            ? 'transform translate-x-0 pointer-event-auto'
            : 'transform translate-x-72 pointer-event-auto'
        } transition-all duration-0 ease-in-out`}
        onClick={() => setFriendsIsOpen((prev) => !prev)}
      >
        <HiOutlineUserGroup size={32} />
      </button>
      <div
        className={`flex flex-col absolute right-0 top-16 z-10 ${
          !friendsIsOpen && 'pointer-events-none'
        }`}
      >
        <div
          style={{
            backgroundImage:
              'linear-gradient(to bottom,hsla(287, 30%, 55%),hsla(276, 31%, 54%),hsla(265, 32%, 53%),hsla(253, 32%, 51%),  hsla(241, 32%, 50%))',
          }}
          className={`flex flex-col h-[80vh] z-10 rounded-l-lg shadow-lg pb-4  w-72 ${
            !friendsIsOpen && 'hidden'
          }  `}
        >
          <div className='px-3 flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-white font-pixel mx-2 my-3.5'>
              Your Friends
            </h2>
            {/* <div
          onClick={() => setFriendsIsOpen(false)}
          className='hover:text-gray-400'
        >
          <AiOutlineCloseCircle size={24} />
        </div> */}
          </div>
          <div className='px-3 mt-2'>
            <input
              type='text'
              placeholder='Search'
              className='w-full bg-gray-100 px-3 py-2 rounded-lg'
            />
          </div>
          <div className='flex-1 h-full overflow-y-auto border-b-0 border-t border-x-0 border-solid p-0 py-2 mt-3'>
            {alphabet.map((letter) => {
              const friendsByLetter = friends.filter(
                (friend) => friend.firstName[0].toUpperCase() === letter
              );
              if (friendsByLetter.length === 0) {
                return null;
              }
              return (
                <div key={letter} className='px-3 mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800 uppercase font-pixel'>
                    {letter}
                  </h3>
                  <ul className='mt-2 grid grid-cols-1 gap-2 p-0'>
                    {friendsByLetter.map((friend) => (
                      <li
                        key={friend.uuid}
                        onClick={() => handleClick(friend)}
                        className='flex items-center bg-pinkUnFocused even:bg-pinkFocused hover:bg-pinkHover duration-1000 cursor-pointer rounded-xl px-2'
                      >
                        <img
                          className='rounded-full w-12 h-12 sm:w-14 sm:h-14'
                          src={friend.avatarUrl}
                          alt={friend.firstName}
                        />
                        <div className='flex flex-col flex-1 pl-2'>
                          <div className='flex items-center justify-between mb-1 border-0 border-b border-solid border-gray-500'>
                            <p className='text-base font-pixel font-semibold text-gray-800 m-1'>
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className='text-sm flex items-center font-medium m-0'>
                              {friend.status === 'online' ? (
                                <GoPrimitiveDot className='text-green-500 w-4 h-4 mr-1' />
                              ) : (
                                <GoPrimitiveDot className='text-gray-400 w-4 h-4 mr-1' />
                              )}
                              {friend.status}
                            </p>
                          </div>
                          <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center hover:scale-125 duration-700 bg-transparent border-0 rounded-full hover:text-gray-200 mr-2'>
                              <AiOutlineEye className='w-6 h-6' />
                            </div>
                            <div className='flex items-center hover:scale-125 duration-700 bg-transparent border-0 rounded-full hover:text-gray-200 mr-2'>
                              <TbSwords className='w-5 h-5' />
                            </div>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleChat(friend);
                              }}
                              className='flex z-10 cursor-pointer items-center hover:scale-125 duration-700 bg-transparent border-0 rounded-full hover:text-gray-200 mr-2'
                            >
                              <BsChatDots className='w-5 h-5' />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendsBar;
