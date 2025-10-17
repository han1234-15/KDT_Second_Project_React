import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  HomeOutlined,
  MailOutlined,
  CalendarOutlined,
  ContactsOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  AppstoreOutlined,
  CommentOutlined,
  DesktopOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
    return (
        <div className={styles.menubar}>
            <Link to="/" className={styles.menu}><HomeOutlined />홈</Link>
            <Link to="/mail" className={styles.menu}><MailOutlined />메일</Link>
            <Link to="/sharedMail" className={styles.menu}><CommentOutlined />공용 메일</Link>
            <Link to="/contacts" className={styles.menu}><TeamOutlined />주소록</Link>
            <Link to="/board" className={styles.menu}><FileTextOutlined />게시판</Link>
            <Link to="/schedule" className={styles.menu}><ScheduleOutlined />일정</Link>
            <Link to="/eApproval" className={styles.menu}><FileDoneOutlined />전자결재</Link>
            <Link to="/workExpense" className={styles.menu}><SolutionOutlined />근무/경비</Link>
            <Link to="/task" className={styles.menu}><DesktopOutlined />업무관리</Link>
            <Link to="/messenger" className={styles.menu}><MessageOutlined />메신저</Link>
            <Link to="/management" className={styles.menu}><SettingOutlined />관리</Link>
        </div>
    );
};

export default Sidebar;