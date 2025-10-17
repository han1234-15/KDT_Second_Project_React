import styles from "./Mail.module.css";
import axios from "axios";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const MailWrite = () => {

     const Navigate = useNavigate();

     const [mail, setMail] = useState(
          { user_id: "김이사(임시)", senderId: "김준표(임시)", recipientId: "", title: "", fileContent: "", content: "" }
      );
  
      const handlechange = (e) => {
          setMail(prev => ({ ...prev, [e.target.name]: e.target.value }))
      }
      //메일 작성
      const handleMailWrite = () => {
          axios.post("http://10.5.5.20/mail",mail, {
            headers: { "Content-Type": "application/json" }
        }).then((res) => {
            setMail(res.data);
            Navigate("/mail");
        });
      }

   

  return (

    <div className={styles.container}>

      <div className={styles.mainHeader}>
        <button className={styles.backBtn} onClick={() => Navigate(-1)}> 뒤로가기 </button> 
         <input type="text" className={styles.containerhalf} placeholder="수신자를 입력하세요" onChange={handlechange}
        name="recipientId" value={mail.recipientId}/>

        <input type="text" className={styles.containerhalf} placeholder="제목을 입력하세요" onChange={handlechange}
        name="title" value={mail.title}/>
      </div>


      <div className={styles.mainBody}>

        <textarea placeholder="글 내용을 입력하세요" 
        style={{ width: "100%", height: "100%", textAlign: "start", fontSize: "20px" }} onChange={handlechange}
          name="content" value={mail.content}/>

      </div>
      <div>
        <button style={{float:"center"}}>파일 업로드</button>   <button style={{float:"right"}} onClick={handleMailWrite}>전송</button>
      

      </div>
    
    </div>

  );
};

export default MailWrite;
