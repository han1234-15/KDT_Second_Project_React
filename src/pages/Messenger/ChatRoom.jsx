// src/pages/Messenger/ChatRoom.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./ChatRoom.module.css";
import { useSocket } from "../../config/SocketContext";
import { caxios } from "../../config/config";
import ContactListInvite from "./ContactListInvite";
import MessengerFileUpload from "./MessengerFileUpload";
import ChatMessageItem from "./ChatMessageItem"; // ✅ 추가 (메모 컴포넌트)

export default function ChatRoom() {
  const [params] = useSearchParams();
  const targetName = params.get("target") || "대화상대";
  const targetRank = params.get("rank") || "";
  const room_id = params.get("room_id") || params.get("roomId");

  const { messages, sendMessage, subscribeRoom, setMessages, sendRead } =
    useSocket();
  const userId = sessionStorage.getItem("LoginID");

  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("");
  const [chromeOffset, setChromeOffset] = useState(0);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [fileList, setFileList] = useState([]);

  const chatEndRef = useRef(null);
  const lastReadIdRef = useRef(null);

  const list = useMemo(() => messages[room_id] || [], [messages, room_id]);

  // ✅ 팝업 열릴 때 미읽음 초기화
  useEffect(() => {
    if (room_id) {
      window.opener?.dispatchEvent(
        new CustomEvent("chatRoomUpdated", { detail: { roomId: room_id } })
      );
    }
  }, [room_id]);

  // ✅ 참여자 목록
  const fetchParticipants = useCallback(async () => {
    if (!room_id) return;
    try {
      const resp = await caxios.get(`/api/chat/members/${room_id}`);
      setParticipants(resp.data || []);
    } catch (err) {
      console.error("참여자 목록 조회 실패:", err);
    }
  }, [room_id]);

  useEffect(() => {
    fetchParticipants();
  }, [room_id]); // 

  // ✅ sender 이름 변환
  const getSenderInfo = useCallback(
    (senderId) => {
      const found = participants.find((p) => p.memberId === senderId);
      if (found) {
        return `${found.name}${found.rankName ? " " + found.rankName : ""}`;
      }
      return `${targetName}${targetRank ? " " + targetRank : ""}`;
    },
    [participants, targetName, targetRank]
  );

  // ✅ 읽음 처리
  useEffect(() => {
    if (!room_id || !userId || list.length === 0) return;
    const last = list[list.length - 1];
    if (
      last.sender !== userId &&
      last.messageId &&
      last.messageId !== lastReadIdRef.current
    ) {
      sendRead(room_id, last.messageId, userId);
      lastReadIdRef.current = last.messageId;
      window.opener?.dispatchEvent(
        new CustomEvent("chatRoomUpdated", { detail: { roomId: room_id } })
      );
    }
  }, [list, room_id, userId, sendRead]);

  // ✅ 최초 메시지 로드 (append 대신 초기 세팅)
  useEffect(() => {
    if (!room_id) return;
    let mounted = true;
    caxios.get(`/api/chat/messages/${room_id}`).then((resp) => {
      if (!mounted) return;
      const oldMsgs = resp.data || [];
      setMessages((prev) => ({
        ...prev,
        [room_id]: oldMsgs,
      }));
    });
    return () => {
      mounted = false;
    };
  }, [room_id, setMessages]);

  // ✅ 소켓 구독
  useEffect(() => {
    if (!room_id) return;
    subscribeRoom(room_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 시간 포맷
  const formatTime = useCallback((t) => {
    if (!t) return "";
    return new Date(t).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // ✅ 메시지 전송
  const handleSend = useCallback(() => {
    if (!input.trim() || !userId || !room_id) return;
    sendMessage(room_id, {
      sender: userId,
      content: input,
      type: "TALK",
    });
    setInput("");
  }, [input, room_id, userId, sendMessage]);

  useEffect(() => {
    const offset = window.outerHeight - window.innerHeight;
    setChromeOffset(offset);
  }, []);

  // ✅ 내가 보낸 메시지면 자동 스크롤
  useEffect(() => {
    if (list.length === 0) return;
    const last = list[list.length - 1];
    if (last.sender === userId) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [list, userId]);

  // ✅ 사이드 패널 제어
  const openSidePanel = (mode) => {
    setPanelMode(mode);
    setPanelOpen(true);
    setMenuOpen(false);
    const w = window.screenX;
    const h = window.screenY;
    window.resizeTo(800, 550 + chromeOffset);
    window.moveTo(w, h);
  };

  const closeSidePanel = () => {
    setPanelOpen(false);
    setPanelMode("");
    const w = window.screenX;
    const h = window.screenY;
    window.resizeTo(400, 550 + chromeOffset);
    window.moveTo(w, h);
  };

  /** ✅ 채팅방 나가기 기능 */
const handleLeaveRoom = async () => {
  if (!room_id || !userId) return;
  const confirmLeave = window.confirm("이 채팅방을 나가시겠습니까?");
  if (!confirmLeave) return;

  try {
    const resp = await caxios.post("/api/chat/leave", null, {
      params: { roomId: room_id },
    });

    if (resp.status === 200) {
      alert("채팅방을 나갔습니다.");
      window.opener?.dispatchEvent(
        new CustomEvent("chatRoomUpdated", { detail: { roomId: room_id } })
      );
      window.close();
    } else {
      alert("채팅방 나가기 실패");
    }
  } catch (err) {
    console.error("채팅방 나가기 오류:", err);
    alert("오류가 발생했습니다.");
  }
};


  // ✅ 파일 목록 조회
  const fetchFileList = useCallback(async () => {
    if (!room_id) return;
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`/api/chat/files?roomId=${room_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setFileList(data);
    } catch (err) {
      console.error("파일 목록 조회 실패:", err);
    }
  }, [room_id]);

  useEffect(() => {
    if (panelMode === "files") {
      fetchFileList();
    }
  }, [panelMode, fetchFileList]);

  // ✅ 상단 제목
  const chatTitle = useMemo(() => {
    if (participants.length > 0) {
      return `${participants
        .filter((p) => p.memberId !== userId)
        .map((p) => `${p.name}${p.rankName ? " " + p.rankName : ""}`)
        .join(", ")}와의 대화`;
    }
    return `${targetName}${targetRank ? " " + targetRank : ""} 님과의 대화`;
  }, [participants, userId, targetName, targetRank]);

  // ✅ 렌더링
  return (
    <div className={styles.popupContainer}>
      {/* 상단 */}
      <div className={styles.topbar}>
        <div className={styles.chatTitle}>{chatTitle}</div>
        <div className={styles.menuContainer}>
          <span onClick={() => setMenuOpen(!menuOpen)}>≡</span>
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={() => openSidePanel("members")}>
                대화상대 초대하기
              </button>
              <button onClick={() => openSidePanel("files")}>첨부파일</button>
              <button
                onClick={handleLeaveRoom}
                style={{
                  color: "red",
                  borderTop: "1px solid #ddd",
                  marginTop: "5px",
                }}
              >
                채팅방 나가기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className={styles.chatBox}>
        {list.map((msg, idx) => {
          const isMine = msg.sender === userId;
          const prevMsg = list[idx - 1];
          const isSameSender = prevMsg?.sender === msg.sender;
          const withinOneMin =
            prevMsg &&
            Math.abs(new Date(msg.sendTime) - new Date(prevMsg.sendTime)) <=
              60000;
          const hideProfile = isSameSender && withinOneMin;

          return (
            <ChatMessageItem
              key={msg.messageId ?? `${msg.sender}_${idx}`}
              msg={msg}
              isMine={isMine}
              hideProfile={hideProfile}
              getSenderInfo={getSenderInfo}
              formatTime={formatTime}
            />
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 입력창 */}
      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>전송</button>
      </div>

      {/* 사이드 패널 */}
      {panelOpen && (
        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <span>
              {panelMode === "files" ? "첨부파일 목록" : "대화상대 초대"}
            </span>
            <button className={styles.closeBtn} onClick={closeSidePanel}>
              X
            </button>
          </div>

          <div className={styles.panelBody}>
            {panelMode === "files" ? (
              <div className={styles.filePanel}>
                <MessengerFileUpload
                  roomId={room_id}
                  onUploadComplete={fetchFileList}
                />
                <div className={styles.fileList}>
                  {fileList.length === 0 ? (
                    <p>첨부된 파일이 없습니다.</p>
                  ) : (
                    fileList.map((f, idx) => (
                      <div key={idx} className={styles.fileItem}>
                        <a
                          href={`/api/chat/download/${f.savedName}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {f.originalName}
                        </a>
                        <span>({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <ContactListInvite
                roomId={room_id}
                onClose={() => {
                  closeSidePanel();
                  fetchParticipants();
                  window.opener?.dispatchEvent(
                    new CustomEvent("chatRoomUpdated", {
                      detail: { roomId: room_id },
                    })
                  );
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
