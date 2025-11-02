import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  CommentOutlined,
  DesktopOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../store/authStore"; //  토큰 가져오기용
import { caxios } from "../../config/config";

const Sidebar = () => {
  const token = useAuthStore((state) => state.token); //  로그인 상태의 토큰을 가져옴
  const location = useLocation(); //  현재 URL 확인
  const [title, setTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 상태

  useEffect(() => {
    //  경로별 페이지 이름 매핑
    const pathTitles = {
      "/": "홈",
      "/mail": "메일",
      "/contacts": "주소록",
      "/board": "게시판",
      "/schedule": "일정",
      "/Eapproval": "전자결재",
      "/workExpense": "근무/경비",
      "/task": "업무관리",
      "/management": "관리",
    };

    const pathname = location.pathname;
    //  가장 긴 경로부터 검사 ( "/" 보다 "/board" 우선 )
    const sortedKeys = Object.keys(pathTitles).sort((a, b) => b.length - a.length);
    const key = sortedKeys.find((k) => pathname.startsWith(k));
    setTitle(key ? pathTitles[key] : "");


    // 서버에 권한 확인 요청
    const checkAdmin = async () => {
      try {
        const res = await caxios.get("/auth/check");
        // 서버에서 { isAdmin: true/false } 형태로 응답한다고 가정

        console.log("어드민:" + res.data);
        setIsAdmin(res.data);
      } catch (err) {
        console.error("권한 확인 실패", err);
        setIsAdmin(false);
      }
    };

    if (token) checkAdmin();
  }, [location.pathname, token]);

  return (
    <div className={styles.side}>
      <div className={styles.sideTitle}>
        <span>{title}</span>
      </div>
      <div className={styles.menubar}>
        <Link to="/" className={styles.menu}><HomeOutlined />홈</Link>
        <Link to="/mail" className={styles.menu}><MailOutlined />메일</Link>
        <Link to="/contacts" className={styles.menu}><TeamOutlined />주소록</Link>
        <Link to="/board" className={styles.menu}><FileTextOutlined />게시판</Link>
        <Link to="/schedule" className={styles.menu}><ScheduleOutlined />일정</Link>
        <Link to="/Eapproval" className={styles.menu}><FileDoneOutlined />전자결재</Link>
        <Link to="/workExpense" className={styles.menu}><SolutionOutlined />근무/경비</Link>
        <Link to="/task" className={styles.menu}><DesktopOutlined />업무관리</Link>
        {isAdmin && (
          <Link to="/management" className={styles.menu}><SettingOutlined />관리</Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;