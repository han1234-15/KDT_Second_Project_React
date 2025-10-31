
import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./Messenger.module.css";

import ChatRoomList from "./ChatRoomList";
import ContactList from "./ContactList";
import Settings from "./Settings";
import { SocketProvider } from "../../config/SocketContext"; 

const Messenger = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      sessionStorage.setItem("token", token);
      console.log(" JWT 토큰 저장됨:", token);
    }
  }, []);

  const isChatPage = location.pathname.includes("chat");

  return (
    //  SocketProvider로 전체 감싸기
    <SocketProvider>
      <div className={styles.messengerContainer}>
        <header className={styles.header}>
          <img src="/logo_puple.png" alt="Infinity 로고" className={styles.logo} />
          <span className={styles.brand}>INFINITY</span>
        </header>

        <div className={styles.profileCard}>
          <div className={styles.profileImg}></div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>홍길동</div>
            <div className={styles.profileStatus}>근무중</div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <Link
            to="/messenger-popup/contacts"
            className={`${styles.menuBtn} ${
              location.pathname.includes("contacts") ? styles.active : ""
            }`}
          >
            <i className="bi bi-person-lines-fill"></i>
            <span>주소록</span>
          </Link>

          <Link
            to="/messenger-popup/chat"
            className={`${styles.menuBtn} ${
              location.pathname.includes("chat") ? styles.active : ""
            }`}
          >
            <i className="bi bi-chat-dots-fill"></i>
            <span>채팅방</span>
          </Link>

          <Link
            to="/messenger-popup/settings"
            className={`${styles.menuBtn} ${
              location.pathname.includes("settings") ? styles.active : ""
            }`}
          >
            <i className="bi bi-gear-fill"></i>
            <span>설정</span>
          </Link>
        </aside>

        <main
          className={`${styles.chatList} ${
            isChatPage ? styles.chatNoPadding : ""
          }`}
        >
          <Routes>
            <Route path="contacts" element={<ContactList />} />
            <Route path="chat" element={<ChatRoomList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<ContactList />} />
          </Routes>
        </main>
      </div>
    </SocketProvider>
  );
};

export default Messenger;
