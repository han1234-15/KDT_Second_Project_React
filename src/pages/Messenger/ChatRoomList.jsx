import React, { useEffect, useState } from "react";
import styles from "./ChatRoomList.module.css";
import { caxios } from "../../config/config";

//  DB에서 가져온 직급 코드를 → 사람이 읽을 수 있는 직급명으로 변환하는 맵
const rankMap = {
  J000: "사장",
  J001: "사원",
  J002: "주임",
  J003: "대리",
  J004: "과장",
  J005: "차장",
  J006: "부장",
  J007: "이사",
  J008: "부사장",
};

export default function ChatRoomList() {
  const [rooms, setRooms] = useState([]); //  채팅방 목록 상태
  const [showSearch, setShowSearch] = useState(false); //  검색창 ON/OFF

  /**
   *  채팅방 목록 API 요청
   *    응답 데이터: [{ roomId, targetName, targetRank, lastMessage, lastUpdatedAt, unread }]
   *    → 화면에 표시
   */
  const loadRooms = async () => {
    try {
      const resp = await caxios.get("/api/chat/rooms");
      setRooms(resp.data || []); //  데이터가 null이면 빈 배열 처리
    } catch (err) {
      console.error("채팅방 조회 실패:", err);
    }
  };

  /**
   *  컴포넌트 최초 로딩 시 채팅방 목록 가져오기
   */
  useEffect(() => {
    loadRooms();
  }, []);

  /**
   *  채팅방 더블클릭 시
   *  - 팝업창 띄움
   *  - QueryString 으로 room_id / 직급 / 이름 전달
   *  - chatroom 페이지에서 읽어서 채팅 진행
   */
  const openChat = (room) => {
    console.log("OPEN:", room);

    const targetName = encodeURIComponent(room.targetName || "대화상대");
    const targetRank = encodeURIComponent(rankMap[room.targetRank] || "");

    const url = `${window.location.origin}/chatroom?room_id=${room.roomId}&target=${targetName}&rank=${targetRank}`;

    window.open(
      url,
      `Chat_${room.roomId}`, //  같은 방이면 기존 팝업 재사용
      "width=400,height=550,resizable=no,scrollbars=no,status=no"
    );
  };

  /**
   *  시간 포맷을 보기 좋게 "오후 06:03" 변환
   */
  const formatTime = (value) => {
    if (!value) return "";
    const t = new Date(value);
    return t.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>

      {/*  상단바 */}
      <div className={styles.header}>
        <span className={styles.title}>채팅</span>
        <i className="bi bi-search" onClick={() => setShowSearch(!showSearch)}></i>
      </div>

      {/*  검색창 (토글 활성화 시 표시) */}
      {showSearch && (
        <div className={styles.searchBox}>
          <input type="text" placeholder="검색..." />
        </div>
      )}

      {/*  채팅방 목록을 나열 */}
      <div className={styles.chatList}>
        {rooms.map((chat) => (
          <div
            key={chat.roomId}
            className={styles.chatItem}
            onDoubleClick={() => openChat(chat)} //  더블클릭 시 채팅방 열기
          >
            {/*  프로필 이미지 */}
            <img
              src={chat.avatar || "/defaultprofile.png"}
              className={styles.avatar}
              alt="프로필"
            />

            <div className={styles.chatInfo}>
              {/*  채팅방 상단: 상대 이름 + 직급 + 시간 */}
              <div className={styles.chatHeader}>
                <span className={styles.chatName}>
                  {chat.targetName || "대화 상대"} {/*  이름 표시 */}
                  {" "}
                  {rankMap[chat.targetRank] || ""} {/*  코드 → 직급명 */}
                </span>

                <span className={styles.chatTime}>
                  {formatTime(chat.lastUpdatedAt)} {/*  시간 표시 */}
                </span>
              </div>

              {/*  최근 메시지가 없으면 안내문 표시 */}
              <div className={styles.chatMessage}>
                {chat.lastMessage || "메시지가 없습니다"}
              </div>
            </div>

            {/*  안 읽은 메시지 배지 */}
            {chat.unread > 0 && (
              <span className={styles.unreadBadge}>{chat.unread}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
