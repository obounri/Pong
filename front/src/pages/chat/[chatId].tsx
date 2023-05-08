import React, { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { GoPrimitiveDot } from 'react-icons/go';
import GeneralLayout from '../../components/GeneralLayout';
import ChatPage from '../../components/Chat/ChatPage';
import { useAuth } from '@/context/auth';
import Loading from '../../components/Loading';
import { useRouter } from 'next/router';

const ChatId = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  console.log(router);
  const chatId = router.query.chatId;
  // Check if chatId is present and redirect to /chat page with chatId parameter
  useEffect(() => {
    if (chatId) {
      router.push({
        pathname: '/chat',
        query: { chatId },
      });
    }
  }, [chatId]);

  return <Loading />;
};

export default ChatId;
