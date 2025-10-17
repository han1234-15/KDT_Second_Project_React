import styles from "./Mail.module.css";
import { useNavigate, BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from 'react';


const Mail = () => {

    const [mail, setMail] = useState([]);
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

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
        axios.get("http://10.5.5.12/mail", { withCredentials: true }).then(resp => {
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

    // 메일 삭제
    const handleMailDelete = () => {
        axios.delete("http://10.5.5.12/mail", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
            setMail(prev => prev.filter(mail => !checkedList.includes(mail.seq)));
        });
    }

    // 전체 체크박스 선택
    const handleAllcheckbox = () => {
        if (!allChecked) {
            // 모든 체크
            setCheckedList(mail.map(contact => contact.seq));
            setAllChecked(true);
        } else {
            // 모두 해제
            setCheckedList([]);
            setAllChecked(false);
        }
    }

    // 개별 체크박스 선택
    const handleSingleCheck = (seq) => {
        if (checkedList.includes(seq)) {
            setCheckedList(checkedList.filter(id => id !== seq));
        } else {
            setCheckedList([...checkedList, seq]);
        }
    }

    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 메일 헤더  */}
            <div className={styles.mainHeader}>



                {/* 메일 헤더 1 */}
                <div className={styles.mainHeadertop} >
                    받은 메일함 :  {mail.length}개의 메일 <br />
                    <button onClick={handleMailWrite} className={styles.headerbutton}>메일쓰기</button>
                    <button onClick={handleMailSent} className={styles.headerbutton}>보낸 메일함</button>
                </div>

                {/* 메일 헤더 2 */}
                <div className={styles.mainHeaderbottom} >

                    {checkedList.length === 0 ? (
                        <>

                        </>) : (
                        <>
                            <button onClick={handleMailDelete} > 삭제 </button>

                        </>
                    )}

                    {/* <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 모든 메일
                        </label>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 중요 메일
                        </label>
                    </div> */}

                </div>


            </div> {/* 메일 헤더  */}
            <hr></hr>

            {/* 메일 양식 */}
            <div className={styles.mainBody}>

                <div className={styles.mainBodyHeader}>
                    <div className={styles.mainBodycheckbox}><input type="checkbox" onClick={handleAllcheckbox} /></div>
                    <div className={styles.mainBodytag}>발신인</div>
                    <div className={styles.mainBodytagTitle}>제목</div>
                    <div className={styles.mainBodytag}>발신날짜</div>
                    <div className={styles.mainBodytag}>첨부파일</div><br></br>
                </div>
                <hr></hr>

                {/* 메일 출력  */}
                <div className={styles.mainBodylist}>

                    {mail.map(e =>

                        <div key={e.seq} className={styles.mainBodylistbox} >
                            <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.senderId}</div>
                            <div className={styles.mainBodytagTitle} onClick={() => handleMailView(e)} >{e.title}</div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.sendDateStr}</div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.fileContent}</div>
                        </div>)}
                </div>

            </div>  {/* 메일 바디 */}

        </div> {/* 메인 창  */}


    </div>



    );






}

export default Mail;