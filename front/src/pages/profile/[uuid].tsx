import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUserById } from '../api/user';
import GeneralLayout from '../../components/GeneralLayout';
import { IUser } from '@/context/auth';
import Profile from '../../components/ProfileComponent';
import Loading from '../../components/Loading';
import { useAuth } from '@/context/auth';

const UserProfile = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { uuid } = router.query;
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // if (uuid === user?.uuid) {
    //   router.push('/profile');
    // }
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (uuid) {
          const res = await axios.get(`http://localhost:3300/user/${uuid}`, {
            withCredentials: true,
          });
          if (res.status !== 200) {
            throw new Error('User not Found.');
          }
          if (isMounted) {
            setUserData(res.data);
            setLoading(false);
          }
        }
      } catch (error) {
        // console.error(error);
        router.push('/404');
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [uuid]);
  if (!isAuthenticated) return <Loading />;

  return (
    <div>
      <Profile
        user={userData}
        authId={user?.uuid}
        link='/profile'
        title='Profile'
        pageName={`${userData?.username}'s Profile`}
      />
    </div>
  );
};

export default UserProfile;
