const getTimeElapsed = (timestamp: string): string => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const year = 365 * day;
  let elapsed: string;

  switch (true) {
    case diff < minute:
      elapsed = 'just now';
      break;
    case diff < hour:
      elapsed = `${Math.floor(diff / minute)} minute${
        diff < 2 * minute ? '' : 's'
      } ago`;
      break;
    case diff < day:
      elapsed = `${Math.floor(diff / hour)} hour${
        diff < 2 * hour ? '' : 's'
      } ago`;
      break;
    case diff < week:
      elapsed = `${Math.floor(diff / day)} day${diff < 2 * day ? '' : 's'} ago`;
      break;
    case diff < year:
      elapsed = `${Math.floor(diff / week)} week${
        diff < 2 * week ? '' : 's'
      } ago`;
      break;
    default:
      elapsed = `${Math.floor(diff / year)} year${
        diff < 2 * year ? '' : 's'
      } ago`;
      break;
  }

  return elapsed;
};

export default getTimeElapsed;
