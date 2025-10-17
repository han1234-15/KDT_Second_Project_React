import styles from "./Mail.module.css";
import { useNavigate, BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from 'react';


const Mail = () => {

    const [mail, setMail] = useState([]);

    const navigate = useNavigate();


    // 메일 작성란 이동
    const handleMailWrite = () => {
        navigate("mailwrite");
    }
 
    const handleMailSent = () => {
         navigate("mailsent");
    }

    //받은 메일 리스트 출력
    const handleMailList = () => {
        axios.get("http://10.5.5.20/mail", { withCredentials: true }).then(resp => {
            setMail(prev => resp.data);
        });
    }
    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleMailList();
    }, []);

    // 메일 보기(클릭)
    const handleMailView = (mailItem) => {
       navigate("mailview", { state: { mail: mailItem } }); // 클릭 시 Mailview 페이지로 이동
    };


    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 메일 헤더  */}
            <div className={styles.mainHeader}>



                {/* 메일 헤더 1 */}
                <div className={styles.mainHeadertop} >
                   받은 메일함 :  {mail.length}개의 메일 <br />
                    <button onClick={handleMailWrite}>메일쓰기</button>
                    <button onClick={handleMailSent}>보낸 메일함</button>
                </div>

                {/* 메일 헤더 2 */}
                <div className={styles.mainHeaderbottom} >

                    <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 모든 메일
                        </label>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 중요 메일
                        </label>
                    </div>

                </div>


            </div> {/* 메일 헤더  */}
            <hr></hr>

            {/* 메일 양식 */}
            <div className={styles.mainBody}>

                <div className={styles.mainBodyHeader}>
                    <div className={styles.mainBodycheckbox}><input type="checkbox" /></div>
                    <div className={styles.mainBodytag}>발신인</div>
                    <div className={styles.mainBodytagTitle}>제목</div>
                    <div className={styles.mainBodytag}>발신날짜</div>
                    <div className={styles.mainBodytag}>첨부파일</div><br></br>
                </div>
                <hr></hr>

                {/* 메일 출력  */}
                <div className={styles.mainBodylist}>

                    {mail.map(e =>
                        
                            <div key={e.seq} className={styles.mainBodylistbox} onClick={() => handleMailView(e)} >
                                <div className={styles.mainBodycheckbox}><input type="checkbox" /></div>
                                <div className={styles.mainBodytag}>{e.senderId}</div>
                                <div className={styles.mainBodytagTitle}>{e.title}</div>
                                <div className={styles.mainBodytag}>{e.sendDate}</div>
                                <div className={styles.mainBodytag}>{e.fileContent}</div>
                        </div>)}
                </div>

            </div>  {/* 메일 바디 */}

        </div> {/* 메인 창  */}


    </div>



    );






}

export default Mail;