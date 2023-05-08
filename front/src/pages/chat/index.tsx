import ChatPage from '@/components/Chat/ChatPage';
import GeneralLayout from '@/components/GeneralLayout';
import { useRouter } from 'next/router';
import React from 'react';

const Chat = () => {
  const router = useRouter();

  const chatId = router.query.chatId;
  if (chatId) {
    const url = window.location.href.split('?')[0];
    window.history.replaceState({}, document.title, url);

  }
  return (
    <GeneralLayout
      title={'Profile'}
      link={'/profile'}
      searchbarDisplay={false}
      pageName={'Play'}
      description={'Classic Pong Game'}
      keywords={''}
    >
      <ChatPage chatId={chatId} />
    </GeneralLayout>
  );
};

export default Chat;
