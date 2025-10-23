import styles from "./Mail.module.css";
import { useNavigate, BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { caxios } from '../../config/config.js';
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';

const MailSent = () => {

    const [mail, setMail] = useState([]);
    const [searchName, setSearchName] = useState(""); // 검색어 상태
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

    // 페이지 이동
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const navigate = useNavigate();



    // 메일 작성란 이동
    const handleMailWrite = () => {
        navigate("/mail/mailwrite");
    }


    //보낸 메일 리스트 출력
    const handleMailList = () => {
        const params = {};
        if (searchName) params.name = searchName;
        caxios.get("/mail/send", { params: params, withCredentials: true }).then(resp => {
            setMail(resp.data);
        });
    }

    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleMailList();
    }, []);


    // 메일 쓰기로 이동
    const handleMail = () => {
        navigate("/mail");

    }

    // 메일 보기(클릭)
    const handleMailView = (mailItem) => {
        navigate("/mail/mailview", { state: { mail: mailItem, Mailres: true } }); // 클릭 시 Mailview 페이지로 이동
    };

    // 메일 삭제
    const handleMailDelete = () => {
        caxios.delete("/mail", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
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

    // 페이지용
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentMails = mail.slice(indexOfFirst, indexOfLast); // mail 참고

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setAllChecked(false);
        setCheckedList([]);
    };


    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>



                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop} >
                    보낸 메일 :  {mail.length}개의 메일 <br />
                    <button onClick={handleMailWrite} className={styles.createbtn}>메일쓰기</button>

                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >
                    {checkedList.length === 0 ? (
                        <>
                            <input type="text" placeholder="검색할 수신자 이름" style={{ width: "50%", height: "50%", borderRadius: "5px", border: "none", justifyContent: "center" }}
                                onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") { handleMailList();}}}></input>
                            <button onClick={handleMailList}>검색</button>
                        </>) : (
                        <>
                            <button onClick={handleMailDelete} style={{ margin: "10px" }}> 삭제 </button>

                        </>
                    )}


                </div>


            </div> {/* 주소록 헤더  */}
            <hr></hr>

            {/* 메일 양식 */}
            <div className={styles.mainBody}>

                <div className={styles.mainBodyHeader}>
                    <div className={styles.mainBodycheckbox}><input type="checkbox" onClick={handleAllcheckbox} /></div>
                    <div className={styles.mainBodytag}>수신자</div>
                    <div className={styles.mainBodytag}>수신자 이메일</div>
                    <div className={styles.mainBodytagTitle}>제목</div>
                    <div className={styles.mainBodytag}>발신날짜</div>
                    <br></br>
                    <hr></hr>
                </div>


                {/* 메일 출력  */}
                <div className={styles.mainBodylist}>

                    {currentMails.map(e =>

                        <div key={e.seq} className={styles.mainBodylistbox} >
                            <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.recipientName}</div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.recipientId}</div>
                            <div className={styles.mainBodytagTitle} onClick={() => handleMailView(e)} >{e.title}</div>
                            <div className={styles.mainBodytag} onClick={() => handleMailView(e)} >{e.sendDateStr}</div>

                            <br></br>
                            <hr></hr>
                            {/* 페이지네이션 */}


                        </div>)}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={mail.length}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>
                </div>


            </div>  {/* 메일 바디 */}

        </div> {/* 메인 메일창  */}


    </div>



    );




}

export default MailSent;