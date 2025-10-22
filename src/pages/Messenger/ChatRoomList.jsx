import React, { useState } from "react";
import styles from "./ChatRoomList.module.css";

const ChatRoomList = () => {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  const chatRooms = [
    {
      id: 1,
      name: "유지민",
      message: "내일 회의 안건 정리 완료했습니다!",
      time: "오후 3:40",
      unread: 2,
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 2,
      name: "김현우",
      message: "API 테스트 성공했어요 🎉",
      time: "오후 2:10",
      unread: 0,
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 3,
      name: "AI 센터",
      message: "데이터셋 정리 완료했습니다.",
      time: "오전 11:50",
      unread: 5,
      avatar: "https://i.pravatar.cc/100?img=3",
    },
    {
      id: 4,
      name: "마케팅팀",
      message: "캠페인 회의 오후로 변경되었습니다.",
      time: "오전 10:20",
      unread: 0,
      avatar: "https://i.pravatar.cc/100?img=4",
    },
  ];

  return (
    <div className={styles.container}>
      {/* 상단바 */}
      <div className={styles.header}>
        <span className={styles.title}>채팅</span>
        <i className="bi bi-search" onClick={toggleSearch}></i>
      </div>

      {/* 검색창 (토글) */}
      <div
        className={`${styles.searchBox} ${
          showSearch ? styles.show : styles.hide
        }`}
      >
        <input
          type="text"
          placeholder="대화 상대 또는 채팅방 검색..."
          className="form-control"
        />
      </div>

      {/* 리스트 */}
      <div className={styles.chatList}>
        {chatRooms.map((chat) => (
          <div key={chat.id} className={styles.chatItem}>
            <img src={chat.avatar} alt={chat.name} className={styles.avatar} />

            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <span className={styles.chatName}>{chat.name}</span>
                <span className={styles.chatTime}>{chat.time}</span>
              </div>
              <div className={styles.chatMessage}>{chat.message}</div>
            </div>

            {chat.unread > 0 && (
              <span className={styles.unreadBadge}>{chat.unread}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatRoomList;
