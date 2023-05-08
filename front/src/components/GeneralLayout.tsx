import styles from '@/styles/GeneralLayout.module.css';
import Layout from './Layout';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import FriendsBar from './FriendsBar';
import { useState } from 'react';

interface LayoutProps {
  title: string;
  link: string;
  searchbarDisplay: boolean;
  pageName: string;
  description: string | undefined;
  keywords: string | undefined;
  children: JSX.Element | undefined;
}
export default function GeneralLayout(props: LayoutProps) {
  const router = useRouter();
  return (
    <>
      <Layout
        title={props.pageName}
        description={props.description}
        keywords={props.keywords}
      >
        <div className={styles.dashboard}>
          <Navbar
            title={props.title}
            link={props.link}
            display={props.searchbarDisplay}
          />

          <div className={styles.bord}>
            <Sidebar page={router.pathname.split('/')[1]} />
            {props.children}
            <FriendsBar />
          </div>
        </div>
      </Layout>
    </>
  );
}

GeneralLayout.defaultProps = {
  searchbarDisplay: false,
};
