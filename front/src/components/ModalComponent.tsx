import React, { useEffect } from "react";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
// Form validation
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
// Icons && toasts
import { RxCrossCircled } from "react-icons/rx";
import { toast } from 'react-toastify';
// Components
import AddMembers from "../components/AddMembers";
interface IGroupdata {
  channelName: string | undefined;
  privacy: string | undefined;
  password: string | undefined;
  members: string[] | undefined;
}

const channelSchema = Yup.object().shape({
  channelName: Yup.string().min(5).max(32).required(),
  privacy: Yup.string().oneOf(["public", "private", "protected"]).required(),
});

interface Iprops {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}
interface SearchResult {
  uuid: string;
  username: string;
  avatarUrl: string;
}

const Modal = ({ setIsOpen }: Iprops) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
  const [perror, setPerror] = useState<string>("");
  const [array, setArray] = useState<SearchResult[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(channelSchema),
  });
  const submitData = async (data: IGroupdata) => {
    try {
      const response = await axios.post(
        "http://localhost:3300/message/group",
        {
          name: data.channelName,
          type: data.privacy,
          password: data.privacy === "protected" ? password : "",
        },
        { withCredentials: true }
      );
      console.log(response.data)
      const group_id = response.data.id;
      console.log('group_id')
      console.log(group_id)
      array.forEach(async (element) =>  {
        const response = await axios.post(
          "http://localhost:3300/message/group/member/invite",
          {
            user_id : element.uuid,
            group_id : group_id
          },
          { withCredentials: true }
        );
        console.log('Group Invitation')
        console.log(response.data)
      });
      toast.success('New channel created')
    } catch (error) {
      toast.error('An error Occurred')
    }
    console.log("data on Submit");
    console.log(data);
    console.log("password is empty", `${password === ""}`);
    console.log("l", "l");
    console.log(array.map((item) => item.uuid));
    setIsOpen(false);
    // toast.success('New channel created')
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    {
      setShowPassword(e.target.value === "protected");
      console.log("e.target.value");
      console.log(e.target.value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setIsValidPassword(/^.{6,16}$/.test(passwordValue));
  };

  useEffect(() => {
    if (showPassword === false) setPassword("");
  }, [showPassword]);
  return (
    <div>
      <div className="flex justify-center items-center fixed top-0 left-0 bg-slate-600 bg-opacity-50 w-screen h-screen ">
        <div
          style={{
            backgroundImage:
              "linear-gradient(to right top, hsl(287, 30%, 55%, 0.7), hsl(271, 31%, 53%, 0.7), hsl(253, 32%, 51%, 0.7), hsl(234, 38%, 48%, 0.7), hsl(215, 79%, 36%, 0.7))",
          }}
          className="flex flex-col p-8 bg-gray-500 w-4/5  md:w-1/2 lg:w-1/3 rounded-xl border border-white border-solid shadow-2xl font-neuePixel text-white"
        >
          <div
            className="flex justify-end"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <RxCrossCircled className="cursor-pointer" />
          </div>
          <h2 className="text-center m-0 mb-4 text-2xl font-pixel text-slate-900 opacity-70">
            Create Channel
          </h2>
          <form
            className="flex justify-center flex-col gap-2 items-center "
            onSubmit={handleSubmit(submitData)}
          >
            <label htmlFor="channelName" className="block text-lg">
              Channel name
            </label>
            <input
              type="text"
              id="channelName"
              {...register("channelName")}
              placeholder="Channel Name"
              className="w-2/3 p-2 m-2 border border-solid rounded"
            />
            {errors.channelName && (
              <p className="text-red-900 my-0 text-sm">
                {errors?.channelName.message}
              </p>
            )}

            <div>
              <label htmlFor="public">
                <input
                  type="radio"
                  id="public"
                  value="public"
                  {...register("privacy")}
                  onChange={handlePrivacyChange}
                  className="text-sm "
                />
                Public
              </label>
              <label htmlFor="private">
                <input
                  type="radio"
                  id="private"
                  value="private"
                  {...register("privacy")}
                  onChange={handlePrivacyChange}
                  className="text-sm"
                />
                Private
              </label>
              <label htmlFor="protected">
                <input
                  type="radio"
                  id="protected"
                  value="protected"
                  {...register("privacy")}
                  onChange={handlePrivacyChange}
                  className="text-sm"
                />
                Protected
              </label>
            </div>
            {errors.privacy && (
              <p className="text-red-900 my-0 text-sm">
                {errors?.privacy.message}
              </p>
            )}

            {showPassword && (
              <div className="flex justify-center flex-col gap-2 items-center w-2/3">
                <label htmlFor="password" className="text-md block">
                  Password
                </label>
                <input
                  type="password"
                  className="w-2/3 p-2 border border-solid rounded "
                  onChange={handlePasswordChange}
                />
                {errors.password && (
                  <p className="text-red-900 my-0 text-sm">
                    {errors?.password.message}
                  </p>
                )}
              </div>
            )}
            {showPassword && !password ? (
              <p className="text-slate-900 my-0 text-sm font-bold">
                A password is required in protected Channels.
              </p>
            ) : password && !isValidPassword ? (
              <p className="text-red-900 my-0 text-sm">
                Invalid password, must be 6-16 characters.
              </p>
            ) : (
              ""
            )}
            <label htmlFor="addMembers" className="block text-lg">
              Add members
            </label>
            <div className="w-96">
              <AddMembers display={true} array={array} setArray={setArray} />
            </div>
            {array.length === 0 ? (
              <p className="text-slate-900 my-0 text-sm font-bold">
                A Members list is required to create a Channel.
              </p>
            ) : ''}
            <button
              type="submit"
              disabled={
                ((showPassword && !password) || (password && !isValidPassword) || array.length === 0)
              }
              className="cursor-pointer w-2/3 font-neuePixel bg-btn-dark-color border border-solid border-pinkHover 
              rounded p-2 text-white shadow-md shadow-blueDark hover:bg-mediaBackgroundColor hover:transition-all hover:border-btn-light"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
// .btn {
//     position: relative;
//     font-family: neue-pixel-font;
//     font-size: 1em;
//     display: block;
//     width: 60% !important;
//     margin-top: 1rem;
//     margin-bottom: 1rem;
//     background: var(--btn-light-color); //btn-dark-color
//     box-shadow: 2px 2px 0 0 var(--primary-dark-color); //blueDark
//     border: 1px solid var(--btn-dark-color); // pinkHover
//     color: #fff;
//     font-style: bold;
//     border-radius: 5px;
//     transition: background .4s ease-in, box-shadow .2s ease-in;
//     cursor: pointer;
// }

// .btn:hover {
//   background: var(--btn-dark-color); // pinkHover
//   box-shadow: 3px 3px 0 0 var(--primary-dark-color); // blueDark
// }
