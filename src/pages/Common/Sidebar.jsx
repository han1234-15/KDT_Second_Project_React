import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { caxios } from "../../config/config";
import {
  BellFill,
  EnvelopeFill,
  CalendarFill as CalendarIcon,
  MegaphoneFill,
  PersonFill,
  PersonVcardFill,
  Repeat,
  SuitcaseLgFill,
  PersonWorkspace,
  AirplaneFill,
  CalendarDateFill,
  Clipboard2Fill,
  GearFill,
  HouseDoorFill,
  PeopleFill,
  Clipboard2CheckFill,
  DiscFill,
  PencilSquare,
  PersonVideo3,
  DisplayFill,
  PencilFill,
} from "react-bootstrap-icons";

import useAuthStore from "../../store/authStore";

const Sidebar = () => {
  const token = useAuthStore((state) => state.token); //  로그인 상태의 토큰을 가져옴
  const location = useLocation(); //  현재 URL 확인
  const [title, setTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 상태
  const [openMenu, setOpenMenu] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 홈 눌렀을 때

  const toggleMenu = (menu) => {
    //  홈 클릭 시: 모든 드롭다운 닫기
    if (menu === "home") {
      setOpenMenu(null);
      return;
    }

    //  다른 메뉴는 토글
    setOpenMenu(openMenu === menu ? null : menu);
  };

  useEffect(() => {
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
        setIsAdmin(false);
      }
    };

    if (token) checkAdmin();
  }, [location.pathname, token]);

  return (
    <div className={styles.side}>
      {/*  gradient 정의 (아이콘 내부용) */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#8e44ad" offset="0%" />   {/* 보라 */}
            <stop stopColor="#2196f3" offset="100%" /> {/* 파랑 */}
          </linearGradient>
        </defs>
      </svg>

      <div className={styles.sideTitle}>
        <span>{title}</span>
      </div>

      <div className={styles.menubar}>
        <Link to="/" className={styles.menu} onClick={() => toggleMenu("home")} >
          <HouseDoorFill />
          홈
        </Link>

        <div className={styles.menu} onClick={() => toggleMenu("mail")}>
          <EnvelopeFill />
          메일
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "mail" ? styles.show : ""
            }`}
        >
          <Link to="/mail/all">받은메일함</Link>
          <Link to="/mail/mailsent">보낸메일함</Link>
        </div>

        <div className={styles.menu} onClick={() => toggleMenu("contacts")}>
          <PeopleFill />
          주소록
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "contacts" ? styles.show : ""
            }`}
        >
          <Link to="/contacts/all">전체주소록</Link>
          <Link to="/contacts/solo">개인주소록</Link>
          <Link to="/contacts/multi">공용주소록</Link>
          <Link to="/contacts/organization">조직도</Link>
        </div>

        <div className={styles.menu} onClick={() => toggleMenu("board")}>
          <PencilFill />
          게시판
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "board" ? styles.show : ""
            }`}
        >
          <Link to="/board/1/announcement">전체게시판</Link>
          <Link to="/board/important">중요게시물</Link>
          <Link to="/board/1/dataroom">자료실</Link>
        </div>

        <div className={styles.menu} onClick={() => toggleMenu("schedule")}>
          <CalendarDateFill />
          일정
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "schedule" ? styles.show : ""
            }`}
        >
          <Link to="/schedule/1">내일정</Link>
          <Link to="/schedule/all">전체일정</Link>
          <Link to="/schedule/important">중요일정</Link>
        </div>

        <div className={styles.menu} onClick={() => toggleMenu("Eapproval")}>
          <Clipboard2CheckFill />
          전자결재
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "Eapproval" ? styles.show : ""
            }`}
        >
          <Link to="/Eapproval/show">진행문서함</Link>
          <Link to="/Eapproval/APPROVED">문서보관함</Link>
        </div>

        <Link to="/workExpense" className={styles.menu}  data-type="work" onClick={() => toggleMenu("workExpense")}>
          <PersonWorkspace />
          근무/경비
        </Link>

        <div className={styles.menu} onClick={() => toggleMenu("task")}>
          <DisplayFill />
          업무관리
        </div>
        <div
          className={`${styles.dropdown} ${openMenu === "task" ? styles.show : ""
            }`}
        >
          <Link to="/task/group">업무 그룹</Link>
          <Link to="/task/responsible">담당 업무</Link>
        </div>

        {isAdmin && (
          <>
            <div className={styles.menu} onClick={() => toggleMenu("management")}>
              <GearFill />
              관리
            </div>
            <div
              className={`${styles.dropdown} ${openMenu === "management" ? styles.show : ""
                }`}
            >
              <Link to="/management/user">사용자관리</Link>
              <Link to="/management/history">사용자접속내역</Link>
              <Link to="/management/manager">관리자설정</Link>
              <Link to="/management/archive">메일아카이빙</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
