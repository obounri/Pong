import Iron from '@/styles/Iron.svg';
import Bronze from '@/styles/Bronze.svg';
import Silver from '@/styles/Silver.svg';
import Gold from '@/styles/Gold.svg';
import Image from 'next/image';

const RankComponent = ({rank , width, height} : {rank : string, width :number, height: number}) => {
  let rankIcon;

  switch (rank) {
    case 'Iron':		
    return <Image src={Iron} alt='Iron' width={width} height={height} />
    case 'Bronze':
      return <Image src={Bronze} alt='Bronze' width={width} height={height} />
    case 'Silver':
      return <Image src={Silver} alt='Silver' width={width} height={height} />
    case 'Gold':
      return <Image src={Gold} alt='Gold' width={width} height={height} />
  }
  return <Image src={Iron} alt='Iron' width={width} height={height} />
}

export default RankComponent;