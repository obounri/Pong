import styles from '@/styles/Profile.module.css';
import Image from 'next/image';
import Silver from '@/styles/Silver.svg';
import { toast } from 'react-toastify';

import { IUser } from '@/context/auth';
import { useState } from 'react';
import axios from 'axios';

import {
  AiOutlineMessage,
  AiOutlineUserAdd,
  AiOutlineUserDelete,
} from 'react-icons/ai';
import { MdOutlinePersonRemoveAlt1 } from 'react-icons/md';
import { BiBlock } from 'react-icons/bi';
import { GiSandsOfTime } from 'react-icons/gi';

import {
  handleInvite,
  handleAccept,
  handleReject,
  handleRemove,
  handleCancel,
  handleBlock,
  handleUnblock,
} from '../../Utils/buttonHandlers';
interface ProfileProps {
  user: IUser | null;
  authId: string | undefined;
}

const ProfileCard = ({ user, authId }: ProfileProps) => {
  const avatarUrl: string | undefined = user?.avatarUrl;
  const status: string | undefined = user?.status;
  const [friendship, setFriendship] = useState<string>(
    user?.friendship || 'not_friend'
  );
  const [hovered, setHovered] = useState(false);
  const handleHover = () => {
    setHovered(true);
  };

  const handleLeave = () => {
    setHovered(false);
  };

  const invite = async (uuid: string | undefined) => {
    const res = await handleInvite(uuid);
    if (res) setFriendship('pending_invite_sent');
  };

  const accept = async (uuid: string | undefined) => {
    const res = await handleAccept(uuid);
    if (res) setFriendship('friend');
  };

  const reject = async (uuid: string | undefined) => {
    const res = await handleReject(uuid);
    if (res) setFriendship('not_friend');
  };

  const remove = async (uuid: string | undefined) => {
    const res = await handleRemove(uuid);
    if (res) setFriendship('not_friend');
  };

  const cancel = async (uuid: string | undefined) => {
    const res = await handleCancel(uuid);
    if (res) setFriendship('not_friend');
  };

  const block = async (uuid: string | undefined) => {
    const res = await handleBlock(uuid);
    if (res) setFriendship('blocked');
  };
  const unblock = async (uuid: string | undefined) => {
    const res = await handleUnblock(uuid);
    if (res) setFriendship('not_friend');
  };

  let buttons;
  switch (friendship) {
    case 'not_friend':
      buttons = (
        <button
          type='button'
          style={{
            backgroundImage:
              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
          }}
          className={`mt-2 flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-opacity-60 hover:bg-violet-600 font-bold text-gray-200`}
          onClick={() => invite(user?.uuid)}
        >
          <AiOutlineUserAdd />
          <p className='m-0'>Add</p>
        </button>
      );
      break;
    case 'pending_invite_sent':
      buttons = (
        <button
          type='button'
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          style={{
            backgroundImage:
              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
          }}
          className={`transition ease-in mt-2 flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-opacity-60 hover:px-6 hover:bg-red-700 hover:font-bold text-gray-200`}
          onClick={() => cancel(user?.uuid)}
        >
          {hovered ? <AiOutlineUserDelete /> : <GiSandsOfTime />}
          <p className='m-0'>{hovered ? 'Cancel' : 'Pending'}</p>
        </button>
      );
      break;
    case 'pending_invite_received':
      buttons = (
        <>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2'>
            <button
              type='button'
              style={{
                backgroundImage:
                  'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
              }}
              className={`flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-opacity-60 hover:bg-violet-600  font-bold text-gray-200`}
              onClick={() => accept(user?.uuid)}
            >
              <AiOutlineUserAdd />
              <p className='m-0'>Accept</p>
            </button>
            <button
              type='button'
              style={{
                backgroundImage:
                  'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
              }}
              className={`flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-red-700  bg-red-600 font-bold text-gray-200`}
              onClick={() => reject(user?.uuid)}
            >
              <AiOutlineUserDelete />
              <p className='m-0'>Reject</p>
            </button>
          </div>
        </>
      );
      break;
    case 'friend':
      buttons = (
        <>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-2 mt-4'>
            <button
              type='button'
              style={{
                backgroundImage:
                  'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
              }}
              className={`flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-opacity-60 hover:bg-violet-600  font-bold text-gray-200`}
            >
              <AiOutlineMessage />
              <p className='m-0'>Chat</p>
            </button>
            <button
              type='button'
              style={{
                backgroundImage:
                  'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.7),hsla(276, 31%, 54%, 0.7),hsla(265, 32%, 53%, 0.7),hsla(253, 32%, 51%, 0.7),  hsla(241, 32%, 50%, 0.7))',
              }}
              className={`flex justify-center py-2 items-center gap-1 text-xl cursor-pointer px-4 border-0 font-neuePixel rounded-lg hover:bg-red-700  bg-red-600 font-bold text-gray-200`}
              onClick={() => remove(user?.uuid)}
            >
              <MdOutlinePersonRemoveAlt1 />
              <p className='m-0'>Remove</p>
            </button>
            <a
              className={`flex justify-center items-center gap-1 cursor-pointer border-0 font-neuePixel rounded-lg  hover:text-gray-900 text-amber-900 `}
              onClick={() => block(user?.uuid)}
            >
              <BiBlock />
              <p className='m-0'>Block</p>
            </a>
          </div>
        </>
      );
      break;
    case 'blocked':
      buttons = (
        <>
          <a
            className={`flex justify-center items-center gap-1 cursor-pointer border-0 font-neuePixel rounded-lg  hover:text-gray-900 text-amber-900 `}
            onClick={() => unblock(user?.uuid)}
          >
            <BiBlock />
            <p className='m-0'>Unblock</p>
          </a>
        </>
      );
      break;
    default:
      buttons = null;
  }

  return (
    <div
      style={{
        backgroundImage:
          'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.5),hsla(276, 31%, 54%, 0.5),hsla(265, 32%, 53%, 0.5),hsla(253, 32%, 51%, 0.5),  hsla(241, 32%, 50%, 0.5))',
      }}
      className='text-xl col-span-1 lg:col-span-2  w-full  py-4 px-8 border shadow-lg  border-solid border-opacity-60 border-white rounded-xl text-white flex flex-col md:flex-row items-center justify-center md:justify-between font-neuePixel'
    >
      {avatarUrl && (
        <div className='flex flex-col items-center'>
          <Image
            src={avatarUrl || avatarUrl}
            width={150}
            height={150}
            className='rounded-full mb-1 md:mb-0'
            alt={'Avatar'}
            priority={true}
            placeholder='empty'
          />
          {authId !== user?.uuid && buttons}
        </div>
      )}

      <div className='w-full md:w-fit flex flex-col justify-center items-center'>
        <h2 className='m-3'>{user?.username}</h2>
        <p>Status : {user?.status}</p>
        <p className='mb-4'>Total XP : 500</p>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <Image
          src={Silver}
          width={150}
          height={150}
          alt='Rank'
          priority={true}
          placeholder={'empty'}
        />
        <span className=''>Rank: Iron</span>
      </div>
    </div>
  );
};
export default ProfileCard;
// export handleInvite,  handleAccept ,handleReject ,  handleRemove,   handleCancel,  handleBlock,  handleUnblock;
