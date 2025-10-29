import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./ChatRoom.module.css";
import { useSocket } from "../../config/SocketContext";
import { caxios } from "../../config/config"; 

export default function ChatRoom() {
  // URL 쿼리에서 채팅 상대 표시용 이름/직책, 방 아이디를 읽는다.
  // 방 아이디(room_id)는 DB 채팅 저장과 STOMP 구독에 반드시 필요하다.
  const [params] = useSearchParams();
  const targetName = params.get("target") || "대화상대";
  const targetRank = params.get("rank") || "";
  const room_id = params.get("room_id");

  // 소켓 컨텍스트: 메시지 목록, 보내기, 구독
  const { messages, sendMessage, subscribeRoom, setMessages } = useSocket();

  // 로그인 사용자의 식별자(id). 메시지 송신 시 sender 로 사용한다.
  const userId = sessionStorage.getItem("LoginID");

  // UI 상태
  const [menuOpen, setMenuOpen] = useState(false);   // 햄버거 메뉴 열림/닫힘
  const [panelOpen, setPanelOpen] = useState(false); // 오른쪽 사이드 패널 열림/닫힘
  const [panelMode, setPanelMode] = useState("");    // "files" | "members"
  const [chromeOffset, setChromeOffset] = useState(0); // 윈도우 프레임 보정
  const [input, setInput] = useState("");            // 입력창 텍스트

  // 채팅 리스트: room_id 키로 보관된 배열을 꺼낸다.
  const list = messages[room_id] || [];

  // 자동 스크롤을 위한 ref (새 메시지 오면 하단으로 스크롤)
  const chatEndRef = useRef(null);

  // 기존 메시지 로드
useEffect(() => {
  if (!room_id) return;

  caxios.get(`/api/chat/messages/${room_id}`)
    .then(resp => {
      const oldMsgs = resp.data || [];

      setMessages(prev => ({
        ...prev,
        [room_id]: [...oldMsgs, ...(prev[room_id] || [])]
      }));
    })
    .catch(err => console.error("기존 메시지 로드 실패:", err));
}, [room_id]);
  
  // 방 아이디가 정해지면 해당 방을 WebSocket 으로 구독한다.
  useEffect(() => {
    if (room_id) {
      subscribeRoom(room_id);
    }
  }, [room_id, subscribeRoom]);

  // 메시지 전송
  // room_id, sender(id), content, type를 포함하여 서버로 전송한다.
  const handleSend = () => {
    if (!input.trim()) return;
    if (!room_id) {
      alert("유효하지 않은 채팅방입니다. 창을 닫고 다시 시도하세요.");
      return;
    }
    if (!userId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    sendMessage(room_id, {
      // room_id는 SocketContext에서 최종적으로 body에 포함시킨다.
      sender: userId,
      content: input,
      type: "TALK",
    });
    setInput("");
  };

  // 컴포넌트 최초 로딩 시 프레임 보정값을 계산한다.
  useEffect(() => {
    const offset = window.outerHeight - window.innerHeight;
    setChromeOffset(offset);
  }, []);

  // 새 메시지가 오면 채팅창 하단으로 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  // 오른쪽 사이드 패널 열기
  const openSidePanel = (mode) => {
    setPanelMode(mode);
    setPanelOpen(true);
    setMenuOpen(false);

    const currentLeft = window.screenX;
    const currentTop = window.screenY;
    const targetWidth = 800;
    const targetHeight = 550 + chromeOffset;

    window.resizeTo(targetWidth, targetHeight);
    window.moveTo(currentLeft, currentTop);
  };

  // 오른쪽 사이드 패널 닫기
  const closeSidePanel = () => {
    setPanelOpen(false);
    setPanelMode("");

    const currentLeft = window.screenX;
    const currentTop = window.screenY;
    const targetWidth = 400;
    const targetHeight = 550 + chromeOffset;

    window.resizeTo(targetWidth, targetHeight);
    window.moveTo(currentLeft, currentTop);
  };

  return (
    <div className={styles.popupContainer}>
      {/* 상단바: 채팅 상대 표시 + 메뉴 */}
      <div className={styles.topbar}>
        {/* 좌측 타이틀: "OOO 직책 님과의 대화" */}
        <div className={styles.chatTitle}>
          {targetName}
          {targetRank ? ` ${targetRank}` : ""} 님과의 대화
        </div>

        {/* 우측: 메뉴 버튼 */}
         <div className={styles.menuContainer}>
          <i
            className="bi bi-list"
            onClick={() => setMenuOpen(!menuOpen)}
          ></i>

          {/* 메뉴 열렸을 때만 표시 */}
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={() => openSidePanel("members")}>
                대화상대 초대하기
              </button>
              <button onClick={() => openSidePanel("files")}>
                첨부파일
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className={styles.chatBox}>
        {list.map((msg, idx) => {
          const isMine = msg.sender === userId;
          return (
            <div
              key={idx}
              className={`${styles.msg} ${isMine ? styles.me : styles.you}`}
            >
              {/* 상대 메시지일 경우 이름/직책 표시 블록 */}
              {!isMine && (
                <div className={styles.senderInfo}>
                  {/* 실제 프로필 이미지를 사용할 계획이라면 아래 img 태그 유지.
                     기본 이미지는 제거하고 레이아웃만 유지하려면 주석 처리 가능 */}
                  {/* <img
                    src={msg.profileImage || "/default-profile.png"}
                    alt="프로필"
                    className={styles.profileThumb}
                  /> */}
                  <div className={styles.senderMeta}>
                    <div className={styles.senderName}>
                      {msg.sender} {targetRank}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.msgBubble}>{msg.content}</div>
            </div>
          );
        })}
        {/* 스크롤 하단 기준점 */}
        <div ref={chatEndRef} />
      </div>

      {/* 하단 입력창 */}
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

      {/* 오른쪽 슬라이드 패널 */}
      {panelOpen && (
        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <span>
              {panelMode === "files" ? "첨부파일 목록" : "대화상대 초대"}
            </span>
            <button
              onClick={closeSidePanel}
              className={styles.closeBtn}
              aria-label="닫기"
            >
              X
            </button>
          </div>

          <div className={styles.panelBody}>
            {panelMode === "files" ? (
              <p>첨부된 파일 목록을 여기에 표시합니다.</p>
            ) : (
              <p>초대 가능한 멤버 목록을 여기에 표시합니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
