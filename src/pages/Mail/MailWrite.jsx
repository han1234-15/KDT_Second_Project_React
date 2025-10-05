import React from "react";
import styles from "./Mail.module.css";

const MailWrite = () => {
  return (

    <div className={styles.container}>

      <div className={styles.mainHeader}>
        <input type="text" className={styles.container} placeholder="글 제목을 입력하세요" />
      </div>


      <div className={styles.mainBody}>

        <textarea placeholder="글 내용을 입력하세요" style={{ width: "100%", height: "100%", textAlign: "start", fontSize: "20px" }} />

      </div>
      <div>
        <button style={{float:"center"}}>파일 업로드</button>   <button style={{float:"right"}}>전송</button>
      

      </div>
    
    </div>

  );
};

export default MailWrite;
