import Layout from '../components/Layout';
import styles from '@/styles/404.module.css';
import { FaGamepad } from 'react-icons/fa';
import { MdOutlineReplay } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/context/auth';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  let url = '/';
  if (isAuthenticated) {
    url = '/dashboard';
  }

  return (
    <div>
      <Layout title='This page could not be found'>
        <div className={styles.container}>
          <div className={styles.boxs}>
            <div className={styles.box}>
              <h2>404</h2>
            </div>
            <div className={styles.icon}>
              <FaGamepad />
            </div>
            <div className={styles.box}>
              <p>This Page could not be found.</p>
            </div>
          </div>
          <div className={styles.link}>
            <MdOutlineReplay />
            <Link href={url}> Go back To Home Page</Link>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default NotFoundPage;
