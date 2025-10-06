import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <Link to="/" className={styles.sidebarButton}>홈</Link>
            <Link to="/mail" className={styles.sidebarButton}>메일</Link>
            <Link to="/board" className={styles.sidebarButton}>게시판</Link>
            <Link to="/schedule" className={styles.sidebarButton}>일정</Link>
            <Link to="/sharedMail" className={styles.sidebarButton}>공용 메일</Link>
            <Link to="/contacts" className={styles.sidebarButton}>주소록</Link>
            <Link to="/messenger" className={styles.sidebarButton}>메신저</Link>
            <Link to="/workExpense" className={styles.sidebarButton}>근무/경비처리</Link>
            <Link to="/eApproval" className={styles.sidebarButton}>전자결재</Link>
            <Link to="/note" className={styles.sidebarButton}>쪽지</Link>
            <Link to="/task" className={styles.sidebarButton}>업무관리</Link>
            <Link to="/management" className={styles.sidebarButton}>그룹웨어 관리</Link>
        </div>
    );
};

export default Sidebar;