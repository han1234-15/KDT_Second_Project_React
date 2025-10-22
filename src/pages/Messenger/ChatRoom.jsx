import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./ChatRoom.module.css";

export default function ChatRoom() {
  const [params] = useSearchParams();
  const targetName = params.get("target") || "대화상대";
  const targetRank = params.get("rank") || "";

  // ✅ 햄버거 메뉴 상태
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.popupContainer}>
      {/* ===== 상단: 상대 이름/직책 + 햄버거 ===== */}
      <div className={styles.topbar}>
        <div className={styles.chatTitle}>
          <i className="bi bi-chat-dots-fill me-2"></i>
          {targetName}
          {targetRank ? ` ${targetRank}` : ""} 님과의 대화
        </div>

        {/* ✅ 햄버거 메뉴 버튼 */}
        <div className={styles.menuContainer}>
          <i
            className="bi bi-list"
            onClick={() => setMenuOpen(!menuOpen)}
          ></i>

          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <button>
                <i className="bi bi-person-plus me-2"></i> 대화상대 초대하기
              </button>
              <button>
                <i className="bi bi-paperclip me-2"></i> 첨부파일
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== 채팅 내용 ===== */}
      <div className={styles.chatBox}>
        <div className={`${styles.msg} ${styles.you}`}>
          <div className={styles.msgBubble}>오늘 회의 자료 준비되었나요?</div>
        </div>

        <div className={`${styles.msg} ${styles.me}`}>
          <div className={styles.msgBubble}>
            네, 3시 회의 전에 업로드 예정이에요!
          </div>
        </div>

        <div className={`${styles.msg} ${styles.you}`}>
          <div className={styles.msgBubble}>좋아요 😊</div>
        </div>
      </div>

      {/* ===== 입력창 ===== */}
      <div className={styles.chatInput}>
        <input type="text" placeholder="메시지를 입력하세요..." />
        <button>
          <i className="bi bi-send-fill me-1"></i> 전송
        </button>
      </div>
    </div>
  );
}
