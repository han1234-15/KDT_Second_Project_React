import React, { useEffect, useState, useCallback } from "react";
import styles from "./ChatRoomList.module.css";
import { caxios } from "../../config/config";
import { useSocket } from "../../config/SocketContext";

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
  const [rooms, setRooms] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const userId = sessionStorage.getItem("LoginID");
  const { subscribeRoom } = useSocket();

  // ✅ 내 모든 채팅방 구독
  useEffect(() => {
    if (!rooms.length) return;

    rooms.forEach((r) => {
      subscribeRoom(r.roomId);
    });
  }, [rooms, subscribeRoom]);

  //  useCallback으로 fetchRooms 고정
  const fetchRooms = useCallback(async () => {
    try {
      const resp = await caxios.get("/api/chat/rooms");
      const roomList = resp.data || [];

      const roomsWithMembers = await Promise.all(
        roomList.map(async (room) => {
          try {
            const res = await caxios.get(`/api/chat/members/${room.roomId}`);
            const members = res.data || [];
            const names = members
              .filter((m) => m.memberId !== userId)
              .map((m) => `${m.name}${m.rankName ? " " + m.rankName : ""}`)
              .join(", ");
            return {
              ...room,
              displayName:
                members.length > 2
                  ? names
                  : names ||
                  `${room.targetName || "대화상대"} ${rankMap[room.targetRank] || ""
                  }`,
            };
          } catch {
            return room;
          }
        })
      );

      setRooms(roomsWithMembers);
    } catch (err) {
      console.error("채팅방 조회 실패:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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

  const formatTime = (value) => {
    if (!value) return "";
    const t = new Date(value);
    return t.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>채팅</span>
        <i className="bi bi-search" onClick={() => setShowSearch(!showSearch)}></i>
      </div>

      {showSearch && (
        <div className={styles.searchBox}>
          <input type="text" placeholder="검색..." />
        </div>
      )}

      <div className={styles.chatList}>
        {rooms.map((chat) => (
          <div
            key={chat.roomId}
            className={styles.chatItem}
            onDoubleClick={() => openChat(chat)}
          >
            <img
              src={chat.avatar || "/defaultprofile.png"}
              className={styles.avatar}
              alt="프로필"
            />
            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <span className={styles.chatName}>
                  {chat.displayName ||
                    `${chat.targetName || "대화상대"} ${rankMap[chat.targetRank] || ""
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
            {chat.unread > 0 && (
              <span className={styles.unreadBadge}>{chat.unread}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
