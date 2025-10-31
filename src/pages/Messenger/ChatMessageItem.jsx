// src/pages/Messenger/ChatMessageItem.jsx
import React from "react";
import styles from "./ChatRoom.module.css";

/**
 * 단일 메시지 아이템.
 * React.memo 로 감싸서 props 변동이 없으면 재렌더를 막는다.
 */
function ChatMessageItem({ msg, isMine, hideProfile, getSenderInfo, formatTime }) {
  return (
    <div className={`${styles.msg} ${isMine ? styles.me : styles.you}`}>
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
              <div className={styles.senderName}>
                {getSenderInfo(msg.sender)}
              </div>
            )}
            <div className={styles.msgRowYou}>
              <div className={styles.msgBubble}>{msg.content}</div>
              <div className={styles.msgTime}>{formatTime(msg.sendTime)}</div>
            </div>
          </div>
        </div>
      )}

      {isMine && (
        <div className={styles.myWrapper}>
          <div className={styles.msgTime}>{formatTime(msg.sendTime)}</div>
          <div className={styles.msgBubble}>{msg.content}</div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ChatMessageItem);
