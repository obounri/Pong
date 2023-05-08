import { useAuth } from '@/context/auth';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BiTime } from 'react-icons/bi';
// import EmptyChatPage from './EmptyChatPage';

interface Message {
  id: string;
  content: string;
  senderUuid: string;
  created_at: string;
}

interface Props {
  receiver: {
    uuid: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
}

const ChatHistory: React.FC<Props> = ({ receiver }) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const { user, socket } = useAuth();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [pageId, setPageId] = useState(1);

  useEffect(() => {
    const getConversation = async () => {
      await axios
        .get(
          `http://localhost:3300/message/privateConversation/${receiver?.uuid}?pageId=${pageId}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          if (pageId === 1) {
            setConversation(res.data);
          } else {
            // Remove duplicates from the conversation array
            const uniqueMessages: Message[] = res.data.filter(
              (message: Message) => {
                return !conversation.some(
                  (existingMessage: Message) =>
                    existingMessage.id === message.id
                );
              }
            );
            setConversation([...conversation, ...uniqueMessages]);
          }
          // Check if there are no more messages to fetch
          if (res.data.length < 50) {
            setNoMoreMessages(true);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    receiver?.uuid && getConversation();
  }, [pageId, noMoreMessages, receiver?.uuid]);

  useEffect(() => {
    socket?.on('privateMessage', ([message]) => {
      setConversation((prev) => [message, ...prev]);
    });
  }, [socket]);

  // Scroll to the bottom of the conversation when it updates
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle pagination on scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.target as HTMLDivElement;
    if (element.scrollTop === 0 && !noMoreMessages) {
      setPageId(pageId + 1);
    }
  };
  return (
    <div
      onScroll={handleScroll}
      className=' bg-white-pure h-full overflow-y-auto font-neuePixel font-semibold '
    >
      <ol className='w-full flex flex-col-reverse  px-4 pt-4'>
        {conversation ? (
          conversation.map((item) => {
            const contactedUser =
              item.senderUuid === user?.uuid ? user : receiver;
            return (
              <li
                // eslint-disable-next-line react/no-array-index-key
                key={item.id}
                className={`p-4 m-2 flex flex-col rounded ${
                  item.senderUuid === user?.uuid ? 'items-start' : ' items-end '
                }`}
              >
                <div
                  className={` p-4 rounded-3xl max-w-[50%] ${
                    item.senderUuid === user?.uuid
                      ? 'bg-pinkUnFocused text-gray-200 ml-12'
                      : ' bg-pinkFocused text-gray-900  mr-12'
                  }`}
                >
                  <p>{item.content}</p>
                  <p className='text-xs flex items-center'>
                    <BiTime size={16} className='pr-1' />
                    {new Date(item.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div
                  className={`flex items-center ${
                    item.senderUuid === user?.uuid
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >
                  <h5 className='text-black-light font-semibold  first-letter:uppercase'>
                    {item.senderUuid === user?.uuid
                      ? 'Me'
                      : `${receiver?.firstName} ${receiver?.lastName}`}
                  </h5>
                  <Image
                    width={40}
                    height={40}
                    src={`${contactedUser.avatarUrl}`}
                    className={`h-10 w-10 rounded-full bg-blue-light ${
                      item.senderUuid !== user?.uuid ? 'ml-2 ' : 'mr-2'
                    }`}
                    alt='Your Avatar'
                  />
                </div>
              </li>
            );
          })
        ) : (
          <div className='w-full h-full mb-16 flex flex-col justify-center items-center'>
            <svg
              className='w-2/12 h-2/12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <h1 className='text-2xl text-bold'>Hey !</h1>
            <h3>Send and receive messages instantly </h3>
          </div>
        )}
        {noMoreMessages && <p>No more messages to show.</p>}
      </ol>
      <div ref={conversationEndRef}></div>
    </div>
  );
};

export default ChatHistory;
