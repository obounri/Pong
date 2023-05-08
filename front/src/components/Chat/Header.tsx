/* eslint-disable react/prop-types */
import Image from 'next/image';
import { useState } from 'react';
// import Modal from '../Modal'
import { BiSearchAlt } from 'react-icons/bi';

const Header = ({ receiver }) => {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className='w-full flex justify-between p-6  items-center border-0 border-b border-solid bg-white bg-opacity-40  rounded-lg rounded-b-none font-neuePixel border-gray-600 py-2'>
      <div className='flex items-center'>
        <div className='m-auto flex rounded-full '>
          <Image
            src={`${receiver?.avatarUrl || ''}`}
            width={40}
            height={40}
            className=' rounded-full bg-blue-light mr-2'
            alt='Your Avatar'
          />
        </div>
        <h5 className='font-semibold text-lg text-black-light dark:text-white-pure first-letter:uppercase'>
          {receiver?.firstName} {receiver?.lastName}
        </h5>
        <span
          className={`w-3 h-3 ml-2 rounded-full border-2 ${
            receiver?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
      </div>
      <div className='mr-12'>
        {/* search */}
        <button
          type='button'
          className=' bg-transparent border-0 cursor-pointer p-1 mx-1'
        >
          <BiSearchAlt size={32} />
        </button>
      </div>
    </div>
  );
};
export default Header;
