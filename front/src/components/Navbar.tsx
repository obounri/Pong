import styles from '@/styles/Navbar.module.css';
import Link from 'next/link';
import Searchbar from './Searchbar';
import {CgProfile} from 'react-icons/cg';
import {FaSignInAlt} from 'react-icons/fa';
import {AiOutlineLogin} from 'react-icons/ai';
import {RiPingPongLine} from 'react-icons/ri';

interface navbarProps {
    link: string,
    title: string,
    display: boolean
}


const Navbar = ({link, title, display}: navbarProps) => {
    const signal = display || title === 'Profile' ? true : false;
  
    return (
        <div className={signal ? styles._navbar : styles.navbar}>
            <div className={signal ? styles._logo : styles.logo}>
                <span>Pong</span>
            </div>
            <Searchbar display={display}/>
            <div className={signal ? styles._about : styles.about}>
                <Link href={link}>
                    <div className={styles.icon}>
                        {title === 'Profile' ?
                        <CgProfile />
                        : (title === 'About' ? <RiPingPongLine/> : (title === 'Sign In' ? <AiOutlineLogin /> : <FaSignInAlt />))}
                    </div>
                    <span>{title}</span>
                </Link>
            </div>
        </div>
    )
};

Navbar.defaultProps = {
    link: '/',
    title: 'Home'
}

export default Navbar;
