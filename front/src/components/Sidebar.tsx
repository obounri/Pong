import styles from '@/styles/Sidebar.module.css'
import { useState } from 'react';
import { useRouter } from 'next/router';
import {AiOutlineHome} from 'react-icons/ai';
import {FaUserFriends, FaGamepad} from 'react-icons/fa';
import {BsFillChatFill} from 'react-icons/bs';
import {MdVideogameAssetOff} from 'react-icons/md';
import { useAuth } from '@/context/auth';


interface ButtonProps {
    content: string,
    selected: string,
    setSelected: (value: string) => void 
}

const iconContent = (content: string) => {
    if (content === 'Home')
        return (
            <AiOutlineHome />
        );
    else if (content === 'Chat')
        return (
            <BsFillChatFill />
        );
    else if (content === 'Game')
        return (
            <FaGamepad />
        );
    else
        return (
            <FaUserFriends />
        );
};

const Button: React.FC<ButtonProps> = ({content, selected, setSelected}) => {
    const router = useRouter();
        
    const handleClick = (content: string)=> {
        if (content.toLowerCase() !== selected){
            setSelected(content);
    
            let url;
            if (content === 'Home')
                url = 'dashboard';
            else
                url = content.toLowerCase();
            router.push(`/${url}`)
        }
    };

    return (
        <div>
            <button className={selected === content.toLowerCase() ? styles.selectedbtn : styles.btn} onClick={() => handleClick(content)}>
                <div className={styles.icon}>
                    {iconContent(content)}
                </div>
                <div className={styles.content}>
                    {content}
                </div>
            </button>
        </div>
    )
}

interface SidebarProps {
    page: string
}


export default function Sidebar ({page} : SidebarProps) {
    const [selectedButton, setSelectedButton]  = useState<string>(() => page === 'dashboard' ? 'home' : page);
    const links = ['Home', 'Game', 'Profile', 'Chat'];
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        auth.signOut();
        router.push('/');
    };

    const listBtn = links.map((content) => {
        return (
            <li key={content}>
                <Button content={content} selected={selectedButton} setSelected={setSelectedButton}/>
            </li>
        );
    })

    return (
        <div className={styles.sidebar}>
            <div className={styles.list}>
                <ul>
                    {listBtn}
                </ul>
            </div>
            <div>
                <button className={styles.btn} id={styles.logout} onClick={handleLogout}>
                    <div className={styles.icon}>
                        <MdVideogameAssetOff />
                    </div>
                    <div className={styles.content}>
                        LogOut
                    </div>
                </button>
            </div>
        </div>
    );
}