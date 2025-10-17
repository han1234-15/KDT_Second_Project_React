import React from "react";
import styles from "./Messenger.module.css";

const ChatRoomList = () => (
   <ul>
    <li className={styles.contactItem}>
      <div className={styles.contactImg}></div>
      <div className={styles.contactName}>개발 1팀 김부장</div>
    </li>
    <li className={styles.contactItem}>
      <div className={styles.contactImg}></div>
      <div className={styles.contactName}>싸장님</div>
    </li>
    <li className={styles.contactItem}>
      <div className={styles.contactImg}></div>
      <div className={styles.contactName}>서비스 개발 김주임</div>
    </li>
  </ul>
);
export default ChatRoomList;
