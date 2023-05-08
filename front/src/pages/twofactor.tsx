import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import styles from '@/styles/Twofactor.module.css';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import { IUser, useAuth } from '@/context/auth';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

const Twofactor = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  // const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState<string>('');
  const [isValidInput, setIsValidInput] = useState<boolean>(false);
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string>('');

  const onEnter = async () => {
    const enable2faResponse = await axios.post(
      'http://localhost:3300/auth/enable2fa',
      {},
      { withCredentials: true }
    );
    console.log('/auth/enable2fa response');
    console.log(enable2faResponse);
    await getTwoFactorQrCode();
  };


    const handleClick = async () => {
        try
        {
            if (code && isValidInput){
                const response = await axios.post('http://localhost:3300/auth/2faLogin',
                { code : code },
                { withCredentials:true }
            )
            console.log('/auth/2falogin response');
            console.log(response);
            if (response.data.success === true) {
                setUser((prev: IUser | null) => {
                    return {...prev, ...{_2fa: true}}
                })
                toast.success('2FA successfull.',{autoClose: 3000});
                router.push('/profile');
            }
            else
                toast.error(`${response.data.msg}`,{autoClose: 3000});
        }
        }
        catch (error) {
            toast.error('2FA failed',{autoClose: 3000});
        }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCode(inputValue);
    setIsValidInput(/^\d{6}$/.test(inputValue));
  };

  const isButtonDisabled = code?.length === 0 || !isValidInput;

  const getTwoFactorQrCode = async () => {
    try {
      if (router.asPath === '/twofactor?2fa=true') {
        // const enable2faResponse = await axios.post('http://localhost:3300/auth/enable2fa', { withCredentials:true } )
        const qrCodeResponse = await axios.post(
          'http://localhost:3300/user/getQr',
          {},
          { withCredentials: true }
        );
        if (qrCodeResponse.status !== 201)
          throw new Error('Failed to enable 2fa.');
        else setQrCode(qrCodeResponse.data.data);
      }
    } catch (error) {
      console.log('Failed to enable 2fa.', error);
    }
  };
  useEffect(() => {
    if (isAuthenticated) onEnter();
    // router.push('/')
    // getTwoFactorQrCode();
  }, [isAuthenticated]);

  // if the asPath is /twofactor?2fa=true then we need to send a post request to the backend to enable 2fa
  // then set the qrcode state to the qrcode returned from the backend
  // then display the qrcode in the page
  return (
    <div>
      {isAuthenticated ? (
        <Layout title='twofactor' description='two factor page'>
          <div>
            <Navbar title='' link='/' display={false} />
            <div className={styles.twofactor}>
              <div className={styles.form}>
                <div>
                  {qrCode !== '' && (
                    <Image
                      src={`${qrCode}`}
                      alt='Qr code'
                      width='200'
                      height='200'
                      className='w-36 h-36 rounded-sm mb-4'
                    ></Image>
                  )}
                </div>
                <label>Enter The 6-digit Code:</label>
                <input
                  type='text'
                  placeholder='******'
                  onChange={handleChange}
                />
                <div>
                  {!code || code.length < 6 ? (
                    <p className={styles.failed} style={{ color: '#fff' }}>
                      please enter the 6 digits.
                    </p>
                  ) : code && !isValidInput ? (
                    <p className={styles.failed} style={{ color: 'red' }}>
                      Invalid input, please enter 6 digits.
                    </p>
                  ) : code && isValidInput ? (
                    <p className={styles.success} style={{ color: 'green' }}>
                      Valid input!
                    </p>
                  ) : (
                    ''
                  )}
                </div>
                <button onClick={handleClick} disabled={isButtonDisabled}>
                  Submit
                </button>
                {/* <button onClick={handleCancelClick}>Cancel</button> */}
              </div>
            </div>
          </div>
        </Layout>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default Twofactor;
