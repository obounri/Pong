import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';
import Layout from '@/components/Layout';
import Navbar from '../components/Navbar';
import Copyrights from '../components/Copyrights';
import { AiFillGoogleCircle } from 'react-icons/ai';
import Image from 'next/image';
import { useAuth } from '@/context/auth';
import Loading from '../components/Loading';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    router.push('/dashboard');
  }

  const handleIntraLogin = () => {
    if (!isAuthenticated) {
      router.push('http://localhost:3300/auth/42/login');
    }
  };

  const handleGoogleLogin = () => {
    if (!isAuthenticated) {
      router.push('http://localhost:3300/auth/google');
    }
  };

  return (
    <>
      {/* { */}
      {/* // !isAuthenticated ? <Loading /> : */}
      <Layout>
        <div className={styles.container}>
          <div className={styles.box}>
            <Navbar link='/about' title='About' display={false} />

            <div className={styles.section}>
              <h3>Classic Pong</h3>
              <div className={styles.btns}>
                <button
                  className={styles.btn}
                  id={styles.intra}
                  onClick={handleIntraLogin}
                >
                  <Image
                    src={'https://profile.intra.42.fr/images/42_logo.svg'}
                    alt='42 intra'
                    width={40}
                    height={40}
                    priority={true}
                    placeholder={'empty'}
                  />
                  <span>Login</span>
                </button>

                <button className={styles.btn} onClick={handleGoogleLogin}>
                  <AiFillGoogleCircle id={styles.google} />
                  <span>Login</span>
                </button>
              </div>
            </div>

            <Copyrights />
          </div>
        </div>
      </Layout>
      {/* // } */}
    </>
  );
}
