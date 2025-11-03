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

  useEffect(() => {
    if (room_id)
      window.opener?.dispatchEvent(
        new CustomEvent("chatRoomUpdated", { detail: { roomId: room_id } })
      );
  }, [room_id]);

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
  }, [room_id]);

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

  useEffect(() => {
    if (!room_id) return;
    let mounted = true;
    caxios.get(`/api/chat/messages/${room_id}`).then((resp) => {
      if (!mounted) return;
      const oldMsgs = resp.data || [];
      setMessages((prev) => ({ ...prev, [room_id]: oldMsgs }));
    });
    return () => {
      mounted = false;
    };
  }, [room_id, setMessages]);

  useEffect(() => {
    if (room_id) subscribeRoom(room_id);
  }, [room_id, subscribeRoom]);

  const formatTime = useCallback((t) => {
    if (!t) return "";
    return new Date(t).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || !userId || !room_id) return;
    sendMessage(room_id, { sender: userId, content: input, type: "TALK" });
    setInput("");
  }, [input, room_id, userId, sendMessage]);

  useEffect(() => {
    setChromeOffset(window.outerHeight - window.innerHeight);
  }, []);

  useEffect(() => {
    if (list.length === 0) return;
    const last = list[list.length - 1];
    if (last.sender === userId)
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list, userId]);

  const openSidePanel = (mode) => {
    setPanelMode(mode);
    setPanelOpen(true);
    setMenuOpen(false);
    window.resizeTo(800, 550 + chromeOffset);
  };

  const closeSidePanel = () => {
    setPanelOpen(false);
    setPanelMode("");
    window.resizeTo(400, 550 + chromeOffset);
  };

  const handleLeaveRoom = async () => {
    if (!room_id || !userId) return;
    if (!window.confirm("이 채팅방을 나가시겠습니까?")) return;
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
      } else alert("채팅방 나가기 실패");
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  const fetchFileList = useCallback(async () => {
    if (!room_id) return;
    try {
      const resp = await caxios.get("/api/chat/files", {
        params: { roomId: room_id },
      });
      setFileList(resp.data);
    } catch (err) {
      console.error("파일 목록 조회 실패:", err);
    }
  }, [room_id]);

  useEffect(() => {
    if (panelMode === "files") fetchFileList();
  }, [panelMode, fetchFileList]);

  const handleDownload = async (file) => {
    try {
      const resp = await caxios.get(`/api/chat/download/${file.sysName}`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.originalName || "download";
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("파일 다운로드 실패:", err);
      alert("파일을 찾을 수 없습니다.");
    }
  };

  const handleGlobalDrop = useCallback(
    async (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (!files.length || !room_id) return;
      try {
        const token = sessionStorage.getItem("token");
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("roomId", room_id);
          const resp = await caxios.post("/api/chat/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          const uploaded = resp.data;
          sendMessage(room_id, {
            sender: userId,
            content: uploaded.originalName,
            fileUrl: uploaded.sysName,
            type: "FILE",
          });
        }
        fetchFileList();
      } catch (err) {
        console.error("드래그앤드롭 파일 업로드 실패:", err);
      }
    },
    [room_id, userId, sendMessage, fetchFileList]
  );

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", handleGlobalDrop);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", handleGlobalDrop);
    };
  }, [handleGlobalDrop]);

  const chatTitle = useMemo(() => {
    if (participants.length > 0)
      return `${participants
        .filter((p) => p.memberId !== userId)
        .map((p) => `${p.name}${p.rankName ? " " + p.rankName : ""}`)
        .join(", ")}와의 대화`;
    return `${targetName}${targetRank ? " " + targetRank : ""} 님과의 대화`;
  }, [participants, userId, targetName, targetRank]);

  return (
    <div className={styles.popupContainer}>
      {/* 상단바 */}
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
          const senderInfo = getSenderInfo(msg.sender);

          return (
            <div
              key={idx}
              className={`${styles.msg} ${isMine ? styles.me : styles.you}`}
            >
              {!isMine && (
                <div className={styles.senderInfo}>
                  {!hideProfile ? (
                    <img
                      src={msg.profileImage || "/defaultprofile.png"}
                      className={styles.profileThumb}
                      alt="프로필"
                    />
                  ) : (
                    <div className={styles.emptyProfileSpace}></div>
                  )}
                  <div className={styles.senderMeta}>
                    {!hideProfile && (
                      <div className={styles.senderName}>{senderInfo}</div>
                    )}
                    <div className={styles.msgRowYou}>
                      {msg.type === "FILE" ? (
                        <div
                          className={`${styles.fileMessage} ${
                            isMine ? styles.mine : styles.youFile
                          }`}
                        >
                          <div className={styles.filePreview}>
                            <i className="bi bi-file-earmark"></i>
                            <span>{msg.content}</span>
                          </div>
                          <button
                            className={styles.downloadMiniBtn}
                            onClick={() =>
                              handleDownload({
                                sysName: msg.fileUrl,
                                originalName: msg.content,
                              })
                            }
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        </div>
                      ) : (
                        <div className={styles.msgBubble}>{msg.content}</div>
                      )}
                      <div className={styles.msgTime}>
                        {formatTime(msg.sendTime)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isMine && (
                <div className={styles.myWrapper}>
                  <div className={styles.msgTime}>
                    {formatTime(msg.sendTime)}
                  </div>
                  {msg.type === "FILE" ? (
                    <div className={`${styles.fileMessage} ${styles.mine}`}>
                      <div className={styles.filePreview}>
                        <i className="bi bi-file-earmark"></i>
                        <span>{msg.content}</span>
                      </div>
                      <button
                        className={styles.downloadMiniBtn}
                        onClick={() =>
                          handleDownload({
                            sysName: msg.fileUrl,
                            originalName: msg.content,
                          })
                        }
                      >
                        <i className="bi bi-download"></i>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.msgBubble}>{msg.content}</div>
                  )}
                </div>
              )}
            </div>
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
                  onUploadComplete={(uploaded) => {
                    if (uploaded && uploaded.sysName) {
                      // ✅ 1. 업로드된 파일을 채팅창에 즉시 표시
                      sendMessage(room_id, {
                        sender: userId,
                        content: uploaded.originalName,
                        fileUrl: uploaded.sysName,
                        type: "FILE",
                      });
                      // ✅ 2. 파일 목록 갱신
                      fetchFileList();
                      // ✅ 3. 사이드 패널 닫기
                      setPanelOpen(false);
                      setPanelMode("");
                      try {
                        window.resizeTo(400, 550 + chromeOffset);
                      } catch {}
                    }
                  }}
                />
                <div className={styles.fileList}>
                  {fileList.length === 0 ? (
                    <p className={styles.noFile}>첨부된 파일이 없습니다.</p>
                  ) : (
                    fileList.map((f, idx) => (
                      <div key={idx} className={styles.fileCard}>
                        <div className={styles.fileIcon}>
                          <i className="bi bi-file-earmark-text"></i>
                        </div>
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>
                            {f.originalName}
                          </span>
                          <span className={styles.fileSize}>
                            {(f.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(f)}
                          className={styles.downloadBtn}
                        >
                          <i className="bi bi-download"></i>
                        </button>
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
