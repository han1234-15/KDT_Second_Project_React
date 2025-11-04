// src/components/chat/ChatRoomList.jsx
import React, { useEffect, useState, useCallback } from "react";
import styles from "./ChatRoomList.module.css";
import { caxios } from "../../config/config";
import { useSocket } from "../../config/SocketContext";

// 직급 코드와 직급명을 매핑하는 객체
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
  J009: "사장",
};

export default function ChatRoomList() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userId = sessionStorage.getItem("LoginID");
  const { subscribeRoom } = useSocket();

  // 채팅방 목록 불러오기
  const fetchRooms = useCallback(async () => {
    try {
      const resp = await caxios.get("/api/chat/rooms");
      const roomList = resp.data || [];

      const roomsWithMembers = await Promise.all(
        roomList.map(async (room) => {
          try {
            const res = await caxios.get(`/api/chat/members/${room.roomId}`);
            const members = res.data || [];

            const others = members.filter((m) => m.memberId !== userId);
            const targetId = others.length === 1 ? others[0].memberId : null;

            // 프로필 이미지 URL 가져오기
            let avatarUrl = "/defaultprofile.png";
            if (targetId) {
              try {
                const userResp = await caxios.get(`/member/info/${targetId}`);
                const userData = userResp.data;
                if (userData?.profileImage_servName) {
                  avatarUrl = `https://storage.googleapis.com/yj_study/${userData.profileImage_servName}`;
                }
              } catch {
                console.warn(`프로필 불러오기 실패: ${targetId}`);
              }
            }

            const names = others
              .map((m) => `${m.name}${m.rankName ? " " + m.rankName : ""}`)
              .join(", ");

            return {
              ...room,
              targetId,
              avatar: avatarUrl,
              displayName:
                members.length > 2
                  ? names
                  : names ||
                    `${room.targetName || "대화상대"} ${
                      rankMap[room.targetRank] || ""
                    }`,
            };
          } catch (err) {
            console.error("멤버 불러오기 실패:", err);
            return room;
          }
        })
      );

      setRooms(roomsWithMembers);
      setFilteredRooms(roomsWithMembers);
    } catch (err) {
      console.error("채팅방 조회 실패:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // 방 목록 STOMP 구독
  useEffect(() => {
    if (!rooms.length) return;
    rooms.forEach((r) => subscribeRoom(r.roomId));
  }, [rooms, subscribeRoom]);

  // 이벤트 수신 시 목록 새로고침
  useEffect(() => {
    const handleUpdate = (e) => {
      const updatedRoomId = e.detail?.roomId;
      if (updatedRoomId) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomId === updatedRoomId ? { ...r, unread: 0 } : r
          )
        );
      }
      setTimeout(fetchRooms, 1000);
    };
    window.addEventListener("chatRoomUpdated", handleUpdate);
    return () => window.removeEventListener("chatRoomUpdated", handleUpdate);
  }, [fetchRooms]);

  useEffect(() => {
    const handleRefresh = () => fetchRooms();
    window.addEventListener("refreshChatRooms", handleRefresh);
    return () => window.removeEventListener("refreshChatRooms", handleRefresh);
  }, [fetchRooms]);

  // 시간 포맷
  const formatTime = (value) => {
    if (!value) return "";
    const t = new Date(value);
    return t.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 채팅방 열기
  const openChat = (room) => {
    const targetName = encodeURIComponent(room.displayName || "대화상대");
    const targetRank = encodeURIComponent(rankMap[room.targetRank] || "");
    const url = `${window.location.origin}/chatroom?room_id=${room.roomId}&target=${targetName}&rank=${targetRank}`;

    setRooms((prev) =>
      prev.map((r) => (r.roomId === room.roomId ? { ...r, unread: 0 } : r))
    );

    window.dispatchEvent(
      new CustomEvent("chatRoomUpdated", { detail: { roomId: room.roomId } })
    );

    window.open(
      url,
      `Chat_${room.roomId}`,
      "width=400,height=550,resizable=no,scrollbars=no,status=no"
    );
  };

  // 검색어 입력 시 실시간 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(rooms);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = rooms.filter((r) =>
        r.displayName?.toLowerCase().includes(lower)
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, rooms]);

  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>채팅</span>
        <i
          className="bi bi-search"
          onClick={() => setShowSearch((prev) => !prev)}
        ></i>
      </div>

      {/* ✅ 검색창 (CSS 전환 방식으로 표시/숨김) */}
      <div
        className={`${styles.searchBox} ${showSearch ? styles.show : ""}`}
      >
        <input
          type="text"
          placeholder="참여자 이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 채팅방 목록 */}
      <div className={styles.chatList}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((chat) => (
            <div
              key={chat.roomId}
              className={styles.chatItem}
              onDoubleClick={() => openChat(chat)}
            >
              {/* 프로필 이미지 */}
              <img
                src={chat.avatar || "/defaultprofile.png"}
                className={styles.avatar}
                alt="프로필"
              />

              {/* 채팅방 정보 */}
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatName}>
                    {chat.displayName ||
                      `${chat.targetName || "대화상대"} ${
                        rankMap[chat.targetRank] || ""
                      }`}
                  </span>
                  <span className={styles.chatTime}>
                    {formatTime(chat.lastUpdatedAt)}
                  </span>
                </div>
                <div className={styles.chatMessage}>
                  {chat.lastMessage || "메시지가 없습니다"}
                </div>
              </div>

              {/* 안 읽은 메시지 수 */}
              {chat.unread > 0 && (
                <span className={styles.unreadBadge}>{chat.unread}</span>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResult}>일치하는 채팅방이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
