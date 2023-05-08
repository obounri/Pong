import { useAuth } from '@/context/auth';
import React from 'react';
import Loading from '../../components/Loading';
import Profile from '../../components/ProfileComponent';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Loading />;
  return (
    <Profile
      user={user}
      authId={user?.uuid}
      link='/register'
      title='Edit Prof'
      pageName='Profile'
    />
  );
};

export default ProfilePage;
