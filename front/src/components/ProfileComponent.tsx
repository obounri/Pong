import GeneralLayout from './GeneralLayout';
import styles from '@/styles/Profile.module.css';
import { FaTrophy } from 'react-icons/fa';
import { GiTrophyCup, GiLaurelsTrophy } from 'react-icons/gi';
import MatchHistory from './MatchHistory';
import { IUser, useAuth } from '@/context/auth';
import Loading from './Loading';
import ProfileCard from './Profile/ProfileCard';
import defaultAvatar from '../assets/60111.jpg';
import Image from 'next/image';
import MatchesSummary from './MatchesSummary'
const matchData = [
  {
    id: 1,
    opponentAvatar: 'path',
    opponentName: 'Rouicha',
    score: '4-0',
    winLoss: 'Win',
    date: '2031-10-04',
  },
  {
    id: 2,
    opponentAvatar: 'path',
    opponentName: '7liwa ',
    score: '5-2',
    winLoss: 'Win',
    date: '2031-10-17',
  },
  {
    id: 3,
    opponentAvatar: 'path',
    opponentName: 'John smith',
    score: '2-3',
    winLoss: 'Loss',
    date: '2031-10-07',
  },
];

interface ProfileProps {
  user: IUser | null;
  authId: string | undefined;
  link: string;
  title: string;
  pageName: string;
}

const Profile = ({ user, authId, link, title, pageName }: ProfileProps) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) <Loading />;
  return (
    <GeneralLayout
      pageName={pageName}
      title={title}
      link={link}
      searchbarDisplay={true}
      keywords={''}
      description='User profile page'
    >
      <div className='mt-[4.5rem] w-full overflow-scroll'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 px-4'>
          <ProfileCard  user={user} authId={authId}/>
          <div
            style={{
              backgroundImage:
                'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.5),hsla(276, 31%, 54%, 0.5),hsla(265, 32%, 53%, 0.5),hsla(253, 32%, 51%, 0.5),  hsla(241, 32%, 50%, 0.5))',
            }}
            className={
              ' text-xl w-full flex flex-col mx-auto pb-4 pt-8 px-8 border shadow-lg border-solid border-white border-opacity-60 rounded-xl  items-center justify-between  mt-0 font-pixel font-normal text-gray-900'
            }
          >
              <MatchesSummary />
          </div>
          <div
            style={{
              backgroundImage:
                'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.5),hsla(276, 31%, 54%, 0.5),hsla(265, 32%, 53%, 0.5),hsla(253, 32%, 51%, 0.5),  hsla(241, 32%, 50%, 0.5))',
            }}
            className={
              'lg:col-span-3 text-xl w-full flex  mx-auto pb-4 pt-8 px-8 border shadow-lg border-solid border-white border-opacity-60 rounded-xl text-white items-center justify-between font-neuePixel flex-col'
            }
          >
            <h1 className='mt-0 font-pixel font-medium text-gray-900'>
              Match History
            </h1>
            <div className='w-full'>
              <ol className='list-none p-0'>
                <li
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
                  }}
                  className='w-full mb-4 flex items-center justify-between p-4 rounded-lg shadow-lg border border-solid border-white border-opacity-60'
                >
                  <div className='flex w-2/5'>
                    <Image
                      src={defaultAvatar} //opponentAvatar
                      alt='avatar'
                      className='w-8 h-8 rounded-full mr-8 hidden lg:block'
                    ></Image>
                    Opponent
                  </div>
                  <h5 className='m-0 w-1/5'>Score</h5>
                  <h5 className='m-0 w-1/5'>Result</h5>
                  <h5 className='m-0 w-1/5 hidden md:block'>Date</h5>
                </li>
                {matchData.map((match) => (
                  <li
                    key={match.id}
                    className='w-full flex items-center justify-between p-4 rounded-lg shadow-lg border border-solid border-white mb-2 last:mb-0   border-opacity-60 bg-pinkUnFocused even:bg-pinkHover text-black text-opacity-70'
                  >
                    <div className='flex items-center w-2/5'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Image
                        src={defaultAvatar}
                        alt='avatar'
                        className='w-8 h-8 rounded-full mr-8 hidden lg:block'
                      />
                      <h5 className='m-0 italic'> {match.opponentName} </h5>
                    </div>
                    <h5 className='m-0 w-1/5'>{match.score}</h5>
                    <h5 className='m-0 w-1/5'>{match.winLoss}</h5>
                    <h5 className='m-0 w-1/5 hidden md:block'>{match.date}</h5>
                  </li>
                ))}
              </ol>
              {/* <MatchHistory matches={matchData} /> */}
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
};
export default Profile;
