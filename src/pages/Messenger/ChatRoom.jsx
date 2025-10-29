import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./ChatRoom.module.css";
import { useSocket } from "../../config/SocketContext";
import { caxios } from "../../config/config";

export default function ChatRoom() {
  const [params] = useSearchParams();
  const targetName = params.get("target") || "대화상대";
  const targetRank = params.get("rank") || "";
  const room_id = params.get("room_id");

  const { messages, sendMessage, subscribeRoom, setMessages } = useSocket();
  const userId = sessionStorage.getItem("LoginID");

  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("");
  const [chromeOffset, setChromeOffset] = useState(0);
  const [input, setInput] = useState("");

  const list = messages[room_id] || [];
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!room_id) return;
    caxios.get(`/api/chat/messages/${room_id}`).then(resp => {
      const oldMsgs = resp.data || [];
      setMessages(prev => ({
        ...prev,
        [room_id]: [...oldMsgs, ...(prev[room_id] || [])]
      }));
    });
  }, [room_id, setMessages]);

  useEffect(() => {
    if (room_id) subscribeRoom(room_id);
  }, [room_id, subscribeRoom]);

  const formatTime = (t) => {
    if (!t) return "";
    return new Date(t).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = () => {
    if (!input.trim() || !userId || !room_id) return;
    sendMessage(room_id, {
      sender: userId,
      content: input,
      type: "TALK",
    });
    setInput("");
  };

  useEffect(() => {
    const offset = window.outerHeight - window.innerHeight;
    setChromeOffset(offset);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

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

  return (
    <div className={styles.popupContainer}>
      <div className={styles.topbar}>
        <div className={styles.chatTitle}>
          {targetName} {targetRank && `${targetRank}`} 님과의 대화
        </div>

        <div className={styles.menuContainer}>
          <i className="bi bi-list" onClick={() => setMenuOpen(!menuOpen)} />

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

      {/*  메시지 리스트 */}
      <div className={styles.chatBox}>
        {list.map((msg, idx) => {
          const isMine = msg.sender === userId;
          const prevMsg = list[idx - 1];
          const isSameSender = prevMsg?.sender === msg.sender;
          const withinOneMin =
            prevMsg && Math.abs(new Date(msg.sendTime) - new Date(prevMsg.sendTime)) <= 60000;

          const hideProfile = isSameSender && withinOneMin;
          return (
            <div key={idx} className={`${styles.msg} ${isMine ? styles.me : styles.you}`}>

              {/*  상대방 메시지 */}
              {!isMine && (
                <div className={styles.senderInfo}>
                  {/*  프로필 있으면 표시, 없으면 동일한 공간 확보 */}
                  {!hideProfile ? (
                    <img
                      src={msg.profileImage || "/defaultprofile.png"}
                      className={styles.profileThumb}
                      alt="프로필"
                    />
                  ) : (
                    <div className={styles.emptyProfileSpace}></div>  //  정렬 유지
                  )}

                  <div className={styles.senderMeta}>
                    {/* ✅ 이름도 숨길 수 있지만 공간은 유지됨 */}
                    {!hideProfile && (
                      <div className={styles.senderName}>
                        {targetName} {targetRank}
                      </div>
                    )}

                    <div className={styles.msgRowYou}>
                      <div className={styles.msgBubble}>{msg.content}</div>
                      <span className={styles.msgTime}>{formatTime(msg.sendTime)}</span>
                    </div>
                  </div>
                </div>
              )}
              {/*  내 메시지 */}
              {isMine && (
                <div className={styles.myWrapper}>
                  <span className={styles.msgTime}>{formatTime(msg.sendTime)}</span>
                  <div className={styles.msgBubble}>{msg.content}</div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 입력 */}
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

      {/*  오른쪽 확장 패널 복귀 */}
      {panelOpen && (
        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <span>{panelMode === "files" ? "첨부파일 목록" : "대화상대 초대"}</span>
            <button className={styles.closeBtn} onClick={closeSidePanel}>X</button>
          </div>

          <div className={styles.panelBody}>
            {panelMode === "files" ? (
              <p>첨부된 파일 목록 표시 예정</p>
            ) : (
              <p>초대 가능한 멤버 목록 예정</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
