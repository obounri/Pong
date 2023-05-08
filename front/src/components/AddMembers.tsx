import axios from "axios";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GoSearch } from "react-icons/go";
import Image from "next/image";
import { useAuth } from "@/context/auth";
import { Dispatch, SetStateAction } from "react";

interface AddMembersProps {
  display: boolean;
  array: SearchResult[];
  setArray: Dispatch<SetStateAction<SearchResult[]>>;
}

interface SearchResult {
  uuid: string;
  username: string;
  avatarUrl: string;
}

const AddMembers: React.FC<AddMembersProps> = ({
  display,
  array,
  setArray,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  // const [showSelected, setShowSelected] = useState<boolean>(false);
  const showSelected = true;

  const route = useRouter();
  const delayedSearch = debounce(async () => {
    if (search !== "") {
      try {
        console.log(
          "--------------------------- -----------------------------------------------"
        );
        const response = await axios.get(
          `http://localhost:3300/user/search/?search=${search}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          const data = await response.data;
          if (data.length === 0) {
            setShowDropdown(false);
            // setResults([]);
          } else setShowDropdown(true);
          setResults(
            data.filter(
              (item: SearchResult) => !array.some((a) => a.uuid === item.uuid)
            )
          );
          setResults((prev) =>
            prev.filter((item: SearchResult) => item.uuid !== user?.uuid)
          );

          // setResults(data.filter((item: SearchResult) => array.indexOf(item) === -1));
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

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tmp = results.find((item) => item.uuid === e.target.value);
    if (tmp != undefined) {
      if (e.target.checked) {
        setArray([...array, tmp]);
        setResults((prev) =>
          prev.filter((item: SearchResult) => item.uuid !== tmp.uuid)
        );
      } else setResults([...results, tmp]);
    }
    if (!e.target.checked) {
      setArray((prev) =>
        prev.filter((item: SearchResult) => item.uuid !== e.target.value)
      );
    }
    console.log(
      "--------------------------- -----------------------------------------------"
    );
    console.log("e.target.value");
    console.log(e.target.checked);
    // setShowSelected(array.length > 0);
  };

  console.log("array");
  console.log(array);
  console.log("results");
  console.log(results);
  console.log("showDropdown");
  console.log(showDropdown);
  console.log("showSelected");
  console.log(showSelected);

  return (
    <div className={display ? "relative" : "hidden"}>
      <div className="flex items-center justify-center">
        <input
          type="text"
          placeholder="Add members"
          value={search}
          onChange={({ target }) => setSearch(target.value)}
          // className="w-2/3 p-2 m-2 border border-solid rounded"
          className=" w-2/3 p-2 m-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>
      {(showDropdown || showSelected) && (
        <div className="flex items-center justify-center">
          <div className="bg-white border rounded w-2/3 max-h-56 overflow-y-scroll shadow-lg">
            {array.map((result) => (
              <div
                key={result.uuid}
                className="px-3 hover:bg-gray-200 text-gray-800  cursor-pointer even:bg-gray-100"
              >
                <div className="flex items-center gap-2 ">
                  <Image
                    src={result.avatarUrl}
                    alt={"User Avatar"}
                    width={30}
                    height={30}
                    className="rounded-full"
                  ></Image>
                  <h6 className="m-0 p-0 font-pixel text-base">
                    {result.username}
                  </h6>
                  <p>(member)</p>
                  <input
                    type="checkbox"
                    value={result.uuid}
                    checked={true}
                    className="ml-auto"
                    onChange={handleCheckChange}
                  />
                </div>
              </div>
            ))}

            {results.map((result) =>
              array.indexOf(result) === -1 ? (
                <div
                  key={result.uuid}
                  className="px-3 py-2 hover:bg-gray-200 text-gray-800  cursor-pointer even:bg-gray-100"
                >
                  <div className="flex items-center gap-2 ">
                    <Image
                      src={result.avatarUrl}
                      alt={"User Avatar"}
                      width={30}
                      height={30}
                      className="rounded-full"
                    ></Image>
                    <h6 className="m-0 p-0 font-pixel text-base">
                      {result.username}
                    </h6>
                    <input
                      type="checkbox"
                      value={result.uuid}
                      className="ml-auto"
                      onChange={handleCheckChange}
                    />
                  </div>
                </div>
              ) : (
                ""
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMembers;
