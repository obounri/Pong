import styles from '@/styles/Register.module.css';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { ChangeEvent, use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import twofactor from './twofactor';
import { IUser, useAuth } from '@/context/auth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { defaultConfig } from 'next/dist/server/config-shared';
import Image from 'next/image';
import { AiFillCamera } from 'react-icons/ai';
import axios from 'axios';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

interface IFormData {
  username: string | undefined;
  avatarUrl: string | undefined;
  twofactor: boolean | undefined;
}

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(5)
    .max(32)
    .matches(/^\S*$/, 'Whitespaces are not allowed in the username'),
  twofactor: Yup.boolean(),
});

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuth();

  const [tmp, settmp] = useState(user?.avatarUrl);
  const [qrcode, setQrcode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const submitData = async (data: IFormData) => {
    console.log('data on submit');
    console.log(data);

    try {
      const response = await axios.patch(
        'http://localhost:3300/user/',
        {
          username: data.username,
          avatarUrl: data.avatarUrl,
          firstLogin: false,
        },
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.msg);
      }
      toast.success('User data updated successfully.', { autoClose: 2000 });
      setUser((prev: IUser | null) => {
        return {
          ...prev,
          ...{ avatarUrl: data.avatarUrl, username: data.username },
        };
      });

      if (data.twofactor === true) {
        if (user?._2fa === true) {
          router.push('/profile');
          return;
        }
        const response = await axios.post(
          'http://localhost:3300/user/2fa',
          { _2fa: true },
          { withCredentials: true }
        );
        if (response.status !== 201) {
          throw new Error('Failed to set 2fa.');
        }
        router.push('/twofactor?2fa=true');
      } else {
        // if user disables 2fa
        const response = await axios.post(
          'http://localhost:3300/user/2fa',
          { _2fa: false },
          { withCredentials: true }
        );
        if (response.status !== 201) {
          throw new Error('Failed to set 2fa.');
        }
        console.log(response);
        setUser((prev: IUser | null) => {
          return {
            ...prev,
            ...{
              avatarUrl: data.avatarUrl,
              username: data.username,
              _2fa: false,
            },
          };
        });
        console.log('router.push to Profile');
        router.push('/profile');
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
      toast.error(`Failed to update user data. ${error}`, { autoClose: 3000 });
    }
  };

  const onChangeAvatar = async (e: ChangeEvent) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const maxSize = 2.5 * 1024 * 1024; // 2.5MB
      if (file.size > maxSize) throw new Error('File too large.');

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type))
        throw new Error("File can only be 'jpeg' or 'png'.");
    } catch (error: any) {
      toast.error(error.message, { autoClose: 3000 });
      return; // stop the function
    }

    // upload the avatar to cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'avatar-preset');

    try {
      const response = await toast.promise(
        fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        ),
        {
          pending: 'Uploading Avatar',
          success: 'Avatar uploaded successfully',
          error: 'Failed to upload Avatar',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to upload avatar.');
      }
      const data = await response.json();
      console.log('Cloudinary data json');
      console.log(data.secure_url);
      setValue('avatarUrl', data.secure_url);
      settmp(data.secure_url);
    } catch (error: any) {
      return;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('useEffect');
      setValue('username', user?.username);
      setValue('avatarUrl', user?.avatarUrl);
      setValue('twofactor', user?._2fa);
      settmp(user?.avatarUrl);
    }
  }, [isAuthenticated]);

  return (
    <>
      {isAuthenticated ? (
        <Layout title='register' description='regsiter page'>
          <div>
            <Navbar title='' link='/' display={false} />

            <div className={styles.register}>
              <div>
                <form onSubmit={handleSubmit(submitData)}>
                  {tmp && (
                    <Image
                      src={tmp}
                      alt='User Avatar'
                      width='200'
                      height='200'
                      className='w-36 h-36 rounded-full mb-4'
                      priority={true}
                      placeholder={'empty'}
                    />
                  )}

                  <label htmlFor='avatar'>
                    <div
                      className={`${styles.costuminput} flex justify-center items-center`}
                    >
                      <AiFillCamera className='w-6 h-6 mr-1' />
                      Upload Your Avatar
                    </div>
                  </label>

                  <input
                    className={styles.avatar}
                    type='file'
                    id='avatar'
                    onChange={onChangeAvatar}
                  />
                  {/* {errors.avatar && <p className='text-red-900 my-0 text-sm'>{errors.avatar.message}</p>} */}
                  <label htmlFor='username'>Name</label>
                  <input
                    type='text'
                    id='username'
                    {...register('username')}
                    placeholder={'Your Name'}
                  />
                  {errors.username && (
                    <p className='text-red-900 my-0 text-sm'>
                      {errors.username.message}
                    </p>
                  )}

                  <div className={styles.checkbox}>
                    <input
                      type='checkbox'
                      id='twofactor'
                      {...register('twofactor')}
                    />
                    <span>
                      Use two-factor authentication with Google authenticator
                    </span>
                    {errors.twofactor && (
                      <p className='text-red-900 my-0 text-sm'>
                        {errors.twofactor.message}
                      </p>
                    )}
                  </div>

                  <input type='submit' className={styles.btn} />
                </form>
              </div>
            </div>
          </div>
        </Layout>
      ) : (
        <Loading />
      )}
    </>
  );
}
