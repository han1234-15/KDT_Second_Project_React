import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";

const Header = () => {
    const logout = useAuthStore(state => state.logout);

    const handleClick = (e) => {

        console.log("로그아웃 시도");

        logout();
        // 로그인 로직 추가 예정
    };


    return (
        <div className={styles.header}>
            <h1>My App</h1>
            <div>
                <Link to="/">Home</Link>
            </div>
            <button onClick={handleClick}>로그아웃 임시</button>
        </div>
    );
};

export default Header;