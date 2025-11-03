// src/pages/Messenger/ChatMessageItem.jsx
import React from "react";
import styles from "./ChatRoom.module.css";

/**
 * 단일 메시지 아이템 컴포넌트
 * props:
 * - msg: 메시지 객체
 * - isMine: 내가 보낸 메시지 여부
 * - hideProfile: 연속 메시지일 때 프로필 숨김 여부
 * - getSenderInfo: 보낸 사람 이름/직급 표시용 함수
 * - profileImage: 상대방 프로필 이미지 URL (ChatRoom에서 전달)
 * - formatTime: 시간 포맷 함수
 * - handleDownload: 파일 다운로드 핸들러 (선택)
 */
function ChatMessageItem({
  msg,
  isMine,
  hideProfile,
  getSenderInfo,
  profileImage,
  formatTime,
  handleDownload,
}) {
  const isFile = msg.type === "FILE";
  const senderInfo = getSenderInfo(msg.sender);

  return (
    <div className={`${styles.msg} ${isMine ? styles.me : styles.you}`}>
      {/* 상대방 메시지 */}
      {!isMine && (
        <div className={styles.senderInfo}>
          {/* 프로필 이미지 표시 */}
          {!hideProfile ? (
            <img
              src={profileImage || "/defaultprofile.png"}
              className={styles.profileThumb}
              alt="프로필"
              onError={(e) => {
                e.target.src = "/defaultprofile.png";
              }}
            />
          ) : (
            <div className={styles.emptyProfileSpace}></div>
          )}

          {/* 발신자 이름 + 메시지 */}
          <div className={styles.senderMeta}>
            {!hideProfile && (
              <div className={styles.senderName}>{senderInfo}</div>
            )}
            <div className={styles.msgRowYou}>
              {isFile ? (
                <div className={`${styles.fileMessage} ${styles.youFile}`}>
                  <div className={styles.filePreview}>
                    <i className="bi bi-file-earmark"></i>
                    <span>{msg.content}</span>
                  </div>
                  <button
                    className={styles.downloadMiniBtn}
                    onClick={() =>
                      handleDownload?.({
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
              <div className={styles.msgTime}>{formatTime(msg.sendTime)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 내가 보낸 메시지 */}
      {isMine && (
        <div className={styles.myWrapper}>
          <div className={styles.msgTime}>{formatTime(msg.sendTime)}</div>
          {isFile ? (
            <div className={`${styles.fileMessage} ${styles.mine}`}>
              <div className={styles.filePreview}>
                <i className="bi bi-file-earmark"></i>
                <span>{msg.content}</span>
              </div>
              <button
                className={styles.downloadMiniBtn}
                onClick={() =>
                  handleDownload?.({
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
}

export default React.memo(ChatMessageItem);
