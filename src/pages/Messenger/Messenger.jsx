import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./Messenger.module.css";

import ChatRoomList from "./ChatRoomList";
import ContactList from "./ContactList";
import Settings from "./Settings";
import { SocketProvider } from "../../config/SocketContext";
import { caxios } from "../../config/config";
import UserProfileImage from "./UserProfileImage"; 

const Messenger = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  /**  이름 / 직급 / 근무 상태 */
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const loginId = sessionStorage.getItem("LoginID");
        if (!token || !loginId) return;

        const resp = await caxios.get("/messenger/member");
        const members = resp.data;
        const me = members.find((m) => m.id === loginId);

        if (me) {
          const rankMap = {
            J001: "사원",
            J002: "주임",
            J003: "대리",
            J004: "과장",
            J005: "차장",
            J006: "부장",
            J007: "이사",
            J008: "부사장",
            J009: "사장",
          };

          setUser({
            id: me.id,
            name: me.name,
            rank_name: rankMap[me.rank_code] || "",
            work_status: me.work_status,
          });
        } else {
          console.warn("내 계정을 member 목록에서 찾지 못했습니다.");
        }
      } catch (err) {
        console.error("멤버 목록 불러오기 실패:", err);
      }
    };

    fetchUserInfo();
  }, []);

  const isChatPage = location.pathname.includes("chat");

  /**  새 방 생성 시 ChatRoomList에도 즉시 갱신 신호 전달 */
  useEffect(() => {
    const handleRefresh = () => {
      console.log("📡 Messenger: 새 방 생성 신호 감지 → ChatRoomList 리프레시");
      window.dispatchEvent(new Event("forceChatListReload"));
    };

    window.addEventListener("refreshChatRooms", handleRefresh);
    return () => window.removeEventListener("refreshChatRooms", handleRefresh);
  }, []);

  return (
    <SocketProvider>
      <div className={styles.messengerContainer}>
        {/* 상단 로고 */}
        <header className={styles.header}>
          <img
            src="/logo_puple.png"
            alt="Infinity 로고"
            className={styles.logo}
          />
          <span className={styles.brand}>INFINITY</span>
        </header>

        {/*  프로필 카드 */}
        <div className={styles.profileCard}>
          <div className={styles.profileImg}>
            {/*  공통 컴포넌트로 교체 */}
            <UserProfileImage size={60} />
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileName}>
              {user
                ? `${user.name} ${user.rank_name || ""}`
                : "로딩 중..."}
            </div>
            <div className={styles.profileStatus}>
              <div className={styles.statusWrapper}>
                <span
                  className={`${styles.statusDot} ${
                    styles[user?.work_status || "offline"]
                  }`}
                ></span>
                <select
                  className={styles.statusSelect}
                  value={user?.work_status || ""}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    setUser((prev) => ({ ...prev, work_status: newStatus }));

                    try {
                      await caxios.put("/messenger/status/self", {
                        work_status: newStatus,
                      });
                      console.log("상태 변경 완료:", newStatus);
                    } catch (err) {
                      console.error("상태 변경 실패:", err);
                      alert("상태 변경에 실패했습니다.");
                    }
                  }}
                >
                  <option value="working">근무중</option>
                  <option value="busy">다른용무중</option>
                  <option value="away">자리비움</option>
                
                </select>
              </div>
            </div>
          </div>
        </div>

        {/*  사이드 메뉴 */}
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

        {/*  본문 */}
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
