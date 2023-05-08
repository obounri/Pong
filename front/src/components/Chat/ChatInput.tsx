import React, { useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { useAuth } from '@/context/auth';

interface Props {
  receiver: {
    uuid: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
}

const ChatInput: React.FC<Props> = ({ receiver }) => {
  const { socket } = useAuth();
  const updatedReceiver = {
    id: receiver?.uuid || '',
    firstName: receiver?.firstName,
    lastName: receiver?.lastName,
    avatarUrl: receiver?.avatarUrl,
  };
  const [message, setMessage] = useState<string>('');
  const sendMessage = ({
    message,
    receiverId,
  }: {
    message: string;
    receiverId: string;
  }) => {
    socket?.emit('privateMessage', {
      message,
      receiverId,
    });
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const onSubmitHandler = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (message.trim()) {
      event.preventDefault();
      sendMessage({
        message,
        receiverId: updatedReceiver.id,
      });
      setMessage('');
    }
  };
  return (
    <div className='w-full flex justify-between px-4 items-center border-t dark:border-dark-gray py-6'>
      <div className='flex justify-between w-full p-5'>
        <input
          id='message'
          className='w-full px-4 py-2 outline-none rounded-md bg-gray-light dark:bg-dark-gray '
          value={message}
          ref={inputRef}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          placeholder='Enter Message...'
          onKeyDown={(event) => event.key === 'Enter' && onSubmitHandler(event)}
          type='text'
        />
        <div className='flex justify-center items-center text-violet-500'>
          {/* photos */}
          <button type='button' className='p-1 mx-1'>
            invite
          </button>
          {/* Send */}
          <button
            type='button'
            onClick={(event) => onSubmitHandler(event)}
            className='p-3 mx-1 rounded-lg text-white-pure bg-violet-500'
          >
            <IoSend className='w-6 h-6 ' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
