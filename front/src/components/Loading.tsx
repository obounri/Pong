interface LoadingProps {
  title: string;
  display: boolean;
  setCancelQueue?: (value: boolean) => void;
}

const Loading = ({ title, display, setCancelQueue }: LoadingProps) => {
  return (
    <div
      style={{
        backgroundImage:
          // 'linear-gradient(to bottom,hsla(287, 30%, 55%),hsla(276, 31%, 54%),hsla(265, 32%, 53%),hsla(253, 32%, 51%),  hsla(241, 32%, 50%))',
          'linear-gradient(to left bottom, #a06baf, #8963ad, #6d5bab, #4c55a8, #134fa3)',
      }}
      className='h-screen flex items-center justify-center'
    >
      <div className='flex flex-col items-center'>
        <svg
          className='animate-spin h-20 w-20 text-white mb-4'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4zm-2-5.291A7.962 7.962 0 0120 12h4c0-3.042-1.135-5.824-3-7.938l-3 2.647z'
          ></path>
        </svg>
        <h1 className='text-4xl font-bold text-light-color tracking-wide font-neuePixel'>
          {title}
        </h1>
        <button
          className='bg-btn-light-color hover:bg-btn-dark-color hover:cursor-pointer text-gray-200 hover:text-white font-bold py-3 px-12 border rounded font-neuePixel'
          style={{ display: display ? '' : 'none' }}
          onClick={() => setCancelQueue && setCancelQueue(true)}
        >
          Cancel Match
        </button>
      </div>
    </div>
  );
};

Loading.defaultProps = {
  title: 'Loading...',
  display: false,
  setCanelQueue: () => {
    return;
  },
};

export default Loading;
