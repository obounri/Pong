import getTimeElapsed from '@/Utils/date';
import { useEffect, useState } from 'react';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { FaCircle } from 'react-icons/fa';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import Header from './Header';
import ModalComponent from '../ModalComponent';
import { useAuth } from '@/context/auth';
import axios from 'axios';
import Image from 'next/image';

type ReceiverType = {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  lastMessage: MessageType;
};

interface MessageType {
  uuid: string;
  sender: string;
  receiver: string;
  timestamp: string;
  content: string;
}

const ChatPage = ({ chatId }: { chatId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, socket } = useAuth();
  const [recentConversation, setRecentConversation] = useState<ReceiverType[]>(
    []
  );

  const [receiver, setReceiver] = useState<ReceiverType>({
    uuid: '',
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
    lastMessage: {
      uuid: '',
      sender: '',
      receiver: '',
      timestamp: '',
      content: '',
    },
  });

  useEffect(() => {
    const getReceiver = async () => {
      try {
        const res = await axios.get<ReceiverType>(
          `http://localhost:3300/user/${chatId}`,
          {
            withCredentials: true,
          }
        );
        setReceiver(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    chatId && getReceiver();

    const getRecentConversation = async () => {
      try {
        const res = await axios.get<ReceiverType[]>(
          'http://localhost:3300/message/privateConversation/users',
          {
            withCredentials: true,
          }
        );
        if (res.data.length === 0) {
          setRecentConversation([]);
        } else {
          setRecentConversation(res.data);
        }
        !chatId && setReceiver(res.data[res.data.length - 1]);
      } catch (err) {
        console.log(err);
      }
    };

    getRecentConversation();
  }, [chatId]);

  useEffect(() => {
    socket?.on('privateUser', ([message]: [MessageType]) => {
      setRecentConversation((prevConversations) => {
        const updatedConversations = prevConversations.filter(
          (conversation) => conversation.uuid !== message.uuid
        ) as any;
        return [message, ...updatedConversations];
      });
    });
  }, [socket]);

  return (
    <>
      <div
        style={{
          backgroundImage:
            'linear-gradient( to bottom, hsl(287, 30%, 55%, 0.7), hsl(276, 31%, 54%, 0.7), hsl(265, 32%, 53%, 0.7), hsl(253, 32%, 51%, 0.7), hsl(241, 32%, 50%, 0.7) )',
        }}
        className='mt-16 bg-opacity-60 flex flex-col rounded-lg w-3/4 m-4'
      >
        <Header receiver={receiver} />
        <ChatHistory receiver={receiver} />
        <ChatInput receiver={receiver} />
      </div>
      <div
        style={{
          backgroundImage:
            'linear-gradient( to bottom, hsl(287, 30%, 55%, 0.7), hsl(276, 31%, 54%, 0.7), hsl(265, 32%, 53%, 0.7), hsl(253, 32%, 51%, 0.7), hsl(241, 32%, 50%, 0.7) )',
        }}
        className='mt-16 bg-opacity-60 flex flex-col rounded-lg w-1/4 m-4'
      >
        <div className='h-full'>
          <div className='w-full flex justify-between p-6  items-center border-0 border-b border-solid bg-white bg-opacity-40  rounded-lg rounded-b-none font-neuePixel border-gray-600 py-2'>
            <h2 className='text-2xl font-bold font-pixel text-white m-7'>
              Recent
            </h2>
          </div>
          <div
            className='cursor-pointer flex text-lg font-bold font-neuePixel items-center justify-center bg-pinkFocused rounded-b-3xl shadow-inner'
            onClick={() => setIsOpen(true)}
          >
            <AiOutlineUsergroupAdd className='font-bold w-6 h-6' />
            New Group
          </div>
          {isOpen && (
            <div
              className={`flex justify-center items-center fixed top-0 left-0 bg-slate-600 bg-opacity-50 w-screen h-screen`}
            >
              <ModalComponent setIsOpen={setIsOpen} />
            </div>
          )}
          <ul className='p-0 h- mx-2.5'>
            {recentConversation.map((conversation) => (
              <li
                key={conversation.uuid}
                className='flex items-center justify-between cursor-pointer hover:scale-105 duration-500 py-2 odd:bg-pinkFocused even:bg-pinkUnFocused rounded-lg'
                onClick={() => {
                  setReceiver(conversation);
                }}
              >
                <div className='relative'>
                  <Image
                    width={32}
                    height={32}
                    src={conversation.avatarUrl}
                    alt={conversation.firstName}
                    className='h-8 w-8 rounded-full mx-2'
                  />
                  <div className='absolute -bottom-1 right-1.5'>
                    <FaCircle className='text-green-500 text-xs' />
                  </div>
                  <div className='flex flex-col'>
                    <h5 className='font-semibold font-pixel m-0'>
                      {conversation.firstName} {conversation.lastName}
                    </h5>
                    <h6 className='font-semibold text-gray-600 m-0'>
                      {conversation.lastMessage.content}
                    </h6>
                  </div>
                  <div className='text-gray-500 m-0'>
                    {getTimeElapsed(conversation.lastMessage.timestamp)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
