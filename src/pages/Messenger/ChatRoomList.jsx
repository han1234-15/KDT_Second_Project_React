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
  // 전체 채팅방 목록
  const [rooms, setRooms] = useState([]);

  // 검색어 필터가 적용된 채팅방 목록
  const [filteredRooms, setFilteredRooms] = useState([]);

  // 검색창 표시 여부
  const [showSearch, setShowSearch] = useState(false);

  // 검색어 입력값
  const [searchTerm, setSearchTerm] = useState("");

  // 현재 로그인한 사용자 ID
  const userId = sessionStorage.getItem("LoginID");

  // STOMP 소켓 구독 훅
  const { subscribeRoom } = useSocket();

  /**
   * 채팅방 목록을 서버에서 불러오는 함수
   * - 각 방에 속한 멤버 정보를 추가로 조회함
   * - 각 멤버의 프로필 이미지 및 이름, 직급 정보를 정리
   */
  const fetchRooms = useCallback(async () => {
    try {
      const resp = await caxios.get("/api/chat/rooms");
      const roomList = resp.data || [];

      // 모든 방에 대해 멤버 정보와 프로필 데이터를 비동기 병렬 처리
      const roomsWithMembers = await Promise.all(
        roomList.map(async (room) => {
          try {
            // 해당 방의 참여자 목록 조회
            const res = await caxios.get(`/api/chat/members/${room.roomId}`);
            const members = res.data || [];

            // 현재 로그인 사용자를 제외한 상대방 정보만 추출
            const others = members.filter((m) => m.memberId !== userId);
            const targetId = others.length === 1 ? others[0].memberId : null;

            // 기본 프로필 이미지 설정
            let avatarUrl = "/defaultprofile.png";

            // 상대방의 프로필 이미지가 존재하면 가져와서 설정
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

            // 대화 상대 이름과 직급명 조합
            const names = others
              .map((m) => `${m.name}${m.rankName ? " " + m.rankName : ""}`)
              .join(", ");

            // 방 정보를 가공하여 반환
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

      // 상태 업데이트
      setRooms(roomsWithMembers);
      setFilteredRooms(roomsWithMembers);
    } catch (err) {
      console.error("채팅방 조회 실패:", err);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 채팅방 목록 최초 조회
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  /**
   * 각 채팅방에 대해 STOMP 구독을 설정
   * - 서버에서 해당 방의 새 메시지를 실시간으로 수신할 수 있도록 함
   */
  useEffect(() => {
    if (!rooms.length) return;
    rooms.forEach((r) => subscribeRoom(r.roomId));
  }, [rooms, subscribeRoom]);

  /**
   * chatRoomUpdated 이벤트를 수신했을 때
   * - 특정 방의 unread(읽지 않은 메시지 수)를 0으로 초기화
   * - 메시지 또는 새 채팅방 감지 시 전역 알림 이벤트(globalMessengerNotify) 발생
   * - 일정 시간 후 채팅방 목록을 새로 불러옴
   */
  useEffect(() => {
    const handleUpdate = (e) => {
      const updatedRoomId = e.detail?.roomId;
      if (updatedRoomId) {
        // 선택된 방의 읽지 않은 메시지 수를 0으로 변경
        setRooms((prev) =>
          prev.map((r) =>
            r.roomId === updatedRoomId ? { ...r, unread: 0 } : r
          )
        );
      }

      // 1초 뒤 목록 갱신
      setTimeout(fetchRooms, 1000);
    };

    window.addEventListener("chatRoomUpdated", handleUpdate);
    return () => window.removeEventListener("chatRoomUpdated", handleUpdate);
  }, [fetchRooms]);

  /**
   * refreshChatRooms 이벤트를 수신했을 때
   * - 전체 채팅방 목록을 즉시 새로 불러옴
   */
  useEffect(() => {
  const handleRefresh = () => fetchRooms();

  // 중복 등록 방지
  window.removeEventListener("refreshChatRooms", handleRefresh);
  window.addEventListener("refreshChatRooms", handleRefresh);

  return () => window.removeEventListener("refreshChatRooms", handleRefresh);
}, [fetchRooms]);

  /**
   * 시간 포맷 함수
   * - 마지막 메시지 시각을 "HH:MM" 형식으로 변환
   */
  const formatTime = (value) => {
    if (!value) return "";
    const t = new Date(value);
    return t.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * 채팅방 더블클릭 시 팝업 창으로 채팅창을 엶
   * - 읽지 않은 메시지를 0으로 변경
   * - 새로 열린 팝업 창에서는 /chatroom 경로로 진입
   */
 const openChat = (room) => {
  const targetName = encodeURIComponent(room.displayName || "대화상대");
  const targetRank = encodeURIComponent(rankMap[room.targetRank] || "");
  const url = `${window.location.origin}/chatroom?room_id=${room.roomId}&target=${targetName}&rank=${targetRank}`;

  // 선택된 방의 읽지 않은 메시지를 0으로 처리
  setRooms((prev) =>
    prev.map((r) => (r.roomId === room.roomId ? { ...r, unread: 0 } : r))
  );

  // 이벤트를 발생시켜 목록 및 알림 갱신
  window.dispatchEvent(
    new CustomEvent("chatRoomUpdated", { detail: { roomId: room.roomId } })
  );

  // 팝업 위치 설정 (사용자 지정)
  const width = 400;
  const height = 550;
  const left = window.screen.width - width - 300;  // 오른쪽 여백 300px
  const top = window.screen.height - height - 1400; // 아래쪽 여백 1400px

  // 새 팝업 창으로 채팅방 열기
  window.open(
    url,
    `Chat_${room.roomId}`,
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
  );
};


  /**
   * 검색어 입력 시 필터링
   * - 검색어가 없으면 전체 목록 표시
   * - 검색어가 있으면 displayName에 해당 문자열이 포함된 채팅방만 표시
   */
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
      {/* 상단 헤더: 타이틀 및 검색 아이콘 */}
      <div className={styles.header}>
        <span className={styles.title}>채팅</span>
        <i
          className="bi bi-search"
          onClick={() => setShowSearch((prev) => !prev)}
        ></i>
      </div>

      {/* 검색창: 검색어 입력창 표시/숨김 전환 */}
      <div className={`${styles.searchBox} ${showSearch ? styles.show : ""}`}>
        <input
          type="text"
          placeholder="참여자 이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 채팅방 목록 영역 */}
      <div className={styles.chatList}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((chat) => (
            <div
              key={chat.roomId}
              className={styles.chatItem}
              onDoubleClick={() => openChat(chat)}
            >
              {/* 프로필 이미지 표시 */}
              <img
                src={chat.avatar || "/defaultprofile.png"}
                className={styles.avatar}
                alt="프로필"
              />

              {/* 채팅방 이름, 마지막 메시지, 시간 표시 */}
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

              {/* 읽지 않은 메시지 수 표시 뱃지 */}
              {chat.unread > 0 && (
                <span className={styles.unreadBadge}>{chat.unread}</span>
              )}
            </div>
          ))
        ) : (
          // 검색 결과가 없을 경우 표시되는 문구
          <div className={styles.noResult}>일치하는 채팅방이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
