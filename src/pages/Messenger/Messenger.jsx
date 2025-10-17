// React와 라우팅 훅/컴포넌트 import
import React, { useEffect } from "react"; // ✅ useEffect 추가 (토큰 설정용)
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

// 부트스트랩 기본 CSS + 아이콘 세트 로드
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// 현재 컴포넌트 전용 CSS Module
import styles from "./Messenger.module.css";

// 컨텐츠 영역에 그릴 하위 화면 컴포넌트들
import ChatRoomList from "./ChatRoomList";
import ContactList from "./ContactList";
import Settings from "./Settings";

// Messenger 라우트의 루트 컴포넌트 (부모 레이아웃 + 내부 라우팅)
const Messenger = () => {
  // 현재 URL 경로를 얻어와서 사이드바 활성 상태(하이라이트)에 활용
  const location = useLocation();

  // ✅ 팝업창이 열릴 때, URL에서 token을 읽어 sessionStorage에 저장
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      sessionStorage.setItem("token", token);
      console.log("✅ JWT 토큰 저장됨:", token);
    }
  }, []);

  // JSX 반환
  return (
    // 전체 레이아웃 컨테이너 (그리드)
    <div className={styles.messengerContainer}>
      {/* ===== 상단 로고/브랜드 영역 ===== */}
      <header className={styles.header}>
        {/* 서비스 로고 이미지 */}
        <img src="/logo_puple.png" alt="Infinity 로고" className={styles.logo} />
        {/* 브랜드명 텍스트 (그라데이션) */}
        <span className={styles.brand}>INFINITY</span>
      </header>

      {/* ===== 프로필(사용자) 영역 ===== */}
      <div className={styles.profileCard}>
        {/* 원형 아바타 (그라데이션 배경) */}
        <div className={styles.profileImg}></div>
        {/* 이름/상태 텍스트 묶음 */}
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>홍길동</div>
          <div className={styles.profileStatus}>근무중</div>
        </div>
      </div>

      {/* ===== 왼쪽 사이드 메뉴 ===== */}
      <aside className={styles.sidebar}>
        {/* 주소록 탭 링크 (현재 경로에 'contacts' 포함되면 active 클래스 추가) */}
        <Link
          to="/messenger/contacts"
          className={`${styles.menuBtn} ${
            location.pathname.includes("contacts") ? styles.active : ""
          }`}
        >
          {/* 부트스트랩 아이콘 + 라벨 */}
          <i className="bi bi-person-lines-fill"></i>
          <span>주소록</span>
        </Link>

        {/* 채팅방 탭 링크 (현재 경로에 'chat' 포함되면 active 클래스 추가) */}
        <Link
          to="/messenger/chat"
          className={`${styles.menuBtn} ${
            location.pathname.includes("chat") ? styles.active : ""
          }`}
        >
          <i className="bi bi-chat-dots-fill"></i>
          <span>채팅방</span>
        </Link>

        {/* 설정 탭 링크 (현재 경로에 'settings' 포함되면 active 클래스 추가) */}
        <Link
          to="/messenger/settings"
          className={`${styles.menuBtn} ${
            location.pathname.includes("settings") ? styles.active : ""
          }`}
        >
          <i className="bi bi-gear-fill"></i>
          <span>설정</span>
        </Link>
      </aside>

      {/* ===== 오른쪽 컨텐츠 영역 (내부 라우팅 스위치) ===== */}
      <main className={styles.chatList}>
        <Routes>
          {/* /messenger/contacts → 주소록 화면 */}
          <Route path="contacts" element={<ContactList />} />
          {/* /messenger/chat → 채팅방 목록 화면 */}
          <Route path="chat" element={<ChatRoomList />} />
          {/* /messenger/settings → 설정 화면 */}
          <Route path="settings" element={<Settings />} />
          {/* 그 외는 기본적으로 채팅방으로 표시 (간단한 폴백) */}
          <Route path="*" element={<ChatRoomList />} />
        </Routes>
      </main>
    </div>
  );
};

// 외부에서 사용할 수 있도록 export
export default Messenger;
