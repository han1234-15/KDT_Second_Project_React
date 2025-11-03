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

const Messenger = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState("/defaultprofile.png");

  /** ✅ 프로필 이미지: /member/userInfo */
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const resp = await caxios.get("/member/userInfo");
        const data = resp.data;

        if (data.profileImage_servName) {
          setProfileImg(`https://storage.googleapis.com/yj_study/${data.profileImage_servName}`);
        } else {
          setProfileImg("/defaultprofile.png");
        }
      } catch (err) {
        console.error("프로필 이미지 불러오기 실패:", err);
      }
    };

    fetchProfileImage();
  }, []);

  /** ✅ 이름 / 직급 / 근무 상태: /messenger/member 에서 로그인 ID 기준으로 필터 */
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
          setUser({
            id: me.id,
            name: me.name,
            rank_name: me.rank_code,
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

  const workStatusText = {
    working: "근무중",
    busy: "다른용무중",
    away: "자리비움",
    offline: "오프라인",
  };

  return (
    <SocketProvider>
      <div className={styles.messengerContainer}>
        {/* 상단 로고 */}
        <header className={styles.header}>
          <img src="/logo_puple.png" alt="Infinity 로고" className={styles.logo} />
          <span className={styles.brand}>INFINITY</span>
        </header>

        {/* ✅ 프로필 카드 */}
        <div className={styles.profileCard}>
          <div className={styles.profileImg}>
            <img
              src={profileImg}
              alt="프로필"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
              onError={(e) => {
                if (e.target.src !== "/defaultprofile.png") {
                  e.target.src = "/defaultprofile.png";
                }
              }}
            />
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>
              {user ? `${user.name} ${user.rank_name || ""}` : "로딩 중..."}
            </div>
            <div className={styles.profileStatus}>
              <div className={styles.statusWrapper}>
                <span className={`${styles.statusDot} ${styles[user?.work_status || "offline"]}`}></span>
                <select
                  className={styles.statusSelect}
                  value={user?.work_status || ""}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    setUser((prev) => ({ ...prev, work_status: newStatus }));

                    try {
                      await caxios.put("/messenger/status/self", { work_status: newStatus });
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
                  <option value="offline">오프라인</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* ✅ 사이드 메뉴 */}
        <aside className={styles.sidebar}>
          <Link
            to="/messenger-popup/contacts"
            className={`${styles.menuBtn} ${location.pathname.includes("contacts") ? styles.active : ""
              }`}
          >
            <i className="bi bi-person-lines-fill"></i>
            <span>주소록</span>
          </Link>

          <Link
            to="/messenger-popup/chat"
            className={`${styles.menuBtn} ${location.pathname.includes("chat") ? styles.active : ""
              }`}
          >
            <i className="bi bi-chat-dots-fill"></i>
            <span>채팅방</span>
          </Link>

          <Link
            to="/messenger-popup/settings"
            className={`${styles.menuBtn} ${location.pathname.includes("settings") ? styles.active : ""
              }`}
          >
            <i className="bi bi-gear-fill"></i>
            <span>설정</span>
          </Link>
        </aside>

        {/* ✅ 본문 */}
        <main className={`${styles.chatList} ${isChatPage ? styles.chatNoPadding : ""}`}>
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
