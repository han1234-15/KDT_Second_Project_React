import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/images/logo.png";
import { Button } from "antd";

const Header = () => {
    const logout = useAuthStore(state => state.logout);

    const handleClick = (e) => {

        console.log("로그아웃 시도");

        logout();
        // 로그인 로직 추가 예정
    };


    return (
        <div className={styles.header}>
            <div className={styles.logo}>
            <img src={logo} alt="로고" />
            <span>INFINITY</span> 
            </div>
            {/* <div>
                <Link to="/">Home</Link>
            </div> */}
            <button onClick={handleClick}>로그아웃</button>
        </div>
    );
};

export default Header;