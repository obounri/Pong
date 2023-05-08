import axios from 'axios';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GoSearch } from 'react-icons/go';
import Image from 'next/image';
interface SearchbarProps {
  display: boolean;
}

interface SearchResult {
  uuid: string;
  name: string;
  username: string;
  avatarUrl: string;
}

const Searchbar: React.FC<SearchbarProps> = ({ display }) => {
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const route = useRouter();
  const delayedSearch = debounce(async () => {
    if (search !== '') {
      try {
        const response = await axios.get(
          `http://localhost:3300/user/search/?search=${search}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          const data = await response.data;
          if (data.length === 0) setShowDropdown(false);
          else setShowDropdown(true);
          setResults(data);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setShowDropdown(false);
    }
  }, 1000);

  useEffect(() => {
    delayedSearch.cancel();
    delayedSearch();
    return delayedSearch.cancel;
  }, [search]);

  return (
    <div className={display ? 'relative' : 'hidden'}>
      <div className='flex items-center'>
        <input
          type='text'
          placeholder='Search'
          value={search}
          onChange={({ target }) => setSearch(target.value)}
          className='w-full border rounded-l py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600'
        />
        <button className='bg-blue-600 text-white rounded-r py-2 px-3'>
          <GoSearch />
        </button>
      </div>
      {showDropdown && (
        <div className='absolute z-50 p-2 bg-white border rounded mt-2 w-full max-h-56 overflow-y-scroll shadow-lg'>
          {results.map((result) => (
            <div
              key={result.uuid}
              className='px-3 py-2 hover:bg-gray-200 text-gray-800  cursor-pointer even:bg-gray-100'
              onClick={() => {
                route.push(`/profile/${result.uuid}`);
                setSearch('');
              }}
            >
              <div className='flex items-center justify-between gap-2'>
                <h6 className='m-0 p-0  font-pixel text-base'>
                  {result.username}
                </h6>
                <Image src={result.avatarUrl} alt={'User Avatar'} width={30} height={30} className='rounded-full'></Image>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Searchbar;
