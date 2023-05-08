import { useAuth } from '@/context/auth';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { FaFire, FaTrophy, FaUsers } from 'react-icons/fa';
import GeneralLayout from '../components/GeneralLayout';
import Link from 'next/link';
import Loading from '../components/Loading';
import Image from 'next/image';
import defaultAvatar from '../assets/60111.jpg';
import RankComponent from '../components/Rank';
import FriendsList from '../components/FriendsList';
interface score {
  id: number; // position in the leaderboard
  name: string; // username
  xp: number; // total xp
  rank: string;
}
interface sortedScores {
  scores: score[];
}

const scores = [
  { id: 1, name: 'John', xp: 1000, rank: 'Gold' },
  { id: 2, name: 'Jane', xp: 900, rank: 'Silver' },
  { id: 3, name: 'Bob', xp: 800, rank: 'Iron' },
];

// function LeaderboardItem ({score} : score)
// {

// }

const ImageComponent = ({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) => {
  return <Image src={src} alt={alt} width={width} height={height} />;
};

const Leaderboard = ({ scores }: sortedScores) => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <ol className='list-none p-0'>
        <li
          style={{
            backgroundImage:
              'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.9),hsla(276, 31%, 54%, 0.9),hsla(265, 32%, 53%, 0.9),hsla(253, 32%, 51%, 0.9),  hsla(241, 32%, 50%, 0.9))',
          }}
          className='w-full mb-4 flex items-center justify-between p-4 rounded-lg shadow-lg border border-solid border-white border-opacity-60'
        >
          <h5 className='m-0 w-1/5'>#</h5>
          <h5 className='m-0 w-1/5 hidden md:block'>Picture</h5>
          <h5 className='m-0 w-1/5'>Name</h5>
          <h5 className='m-0 w-1/5'>XP</h5>
          <h5 className='m-0 w-1/5 hidden md:block'>rank</h5>
        </li>
        {scores.map((score) => (
          <li
            key={score.id}
            className='w-full flex items-center justify-between p-4 rounded-lg shadow-lg border border-solid border-white mb-2 last:mb-0   border-opacity-60 bg-pinkUnFocused even:bg-pinkHover text-black text-opacity-70'
          >
            <h5 className='m-0 w-1/5 '>{score.id}</h5>
            <div className='m-0 w-1/5 hidden md:block'>
              <Image
                src={defaultAvatar}
                alt='avatar'
                width={50}
                height={50}
                className='rounded-full'
              />
            </div>
            <h5 className='m-0 w-1/5 '>{score.name}</h5>
            <h5 className='m-0 w-1/5 '>{score.xp}</h5>
            <div className='m-0 w-1/5 hidden md:block'>
              <RankComponent rank={score.rank} width={50} height={50} />
            </div>
            {/* {score.id} : {score.name}: {score.score} : {score.avatarUrl} : {RankComponent({rank:score.rank,width: 50,height: 50})} */}
          </li>
        ))}
      </ol>
    </div>
  );
};

// export default function Dashboard() {
//   const router = useRouter();
//   const redirectGame = () => {
//     router.push("/game");
// interface IUser {
//   id: number;
//   name: string;
//   email: string;
//   avatarUrl: string;
// }
const Dashboard: FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Loading />;

  return (
    <GeneralLayout
      title='Profile'
      description={'User Dashboard'}
      pageName={'dashboard'}
      link='/profile'
      searchbarDisplay={true}
      keywords={''}
    >
      <div className='mt-[4.5rem] w-full overflow-scroll'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 px-4'>
          <FriendsList />
          <div
            style={{
              backgroundImage:
                'linear-gradient(to bottom,hsla(287, 30%, 55%, 0.5),hsla(276, 31%, 54%, 0.5),hsla(265, 32%, 53%, 0.5),hsla(253, 32%, 51%, 0.5),  hsla(241, 32%, 50%, 0.5))',
            }}
            className='bg-btn-dark-color lg:col-span-3 text-xl w-full flex  mx-auto py-4  px-8 border shadow-lg border-solid border-white border-opacity-60 rounded-xl text-white items-center justify-between font-neuePixel flex-col'
          >
            <div className='w-full'>
              <h2 className='text-center font-pixel text-purple-200 text-4xl'>
                Leaderboard
              </h2>
              <Leaderboard scores={scores} />
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
};
export default Dashboard;
