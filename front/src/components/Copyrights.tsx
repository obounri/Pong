import styles from '@/styles/Copyrights.module.css';
import Link from 'next/link';

const Copyrights = () => {
  return (
    <div className={styles.copyrights}>
      <div className={styles.links}>
          <div>
            &copy; 2023
          </div>
          <Link href="https://profile.intra.42.fr/users/imannouc" target='_blank'>
          imannouc
          </Link>
          <Link href="https://profile.intra.42.fr/users/obounri" target='_blank'>
          obounri
          </Link>
          <Link href="https://profile.intra.42.fr/users/zael-mab" target='_blank'>
          zael-mab
          </Link>
      </div>
    </div>
  )
}

export default Copyrights;
