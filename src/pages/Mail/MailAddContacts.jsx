import styles from "./Mail.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Pagination } from 'antd'; // antd Pagination 임포트

const MailAddContacts = ({ onSelect, onCancel }) => {

    const Navigate = useNavigate();

    const [contacts, setContacts] = useState([]); // 주소록 데이터 관리
    const [searchName, setSearchName] = useState(""); // 검색어 상태
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

    // 페이징 상태 추가
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5); // 페이지당 5개 고정

    // 모달 내부 이동
    const [view, setView] = useState("all");

    const handleContactsAll = () => setView("all");
    const handleContactsSolo = () => setView("solo");
    const handleContactsMulti = () => setView("multi");

    // 주소록 검색 +리스트 
    const handleContactsList = () => {
        const params = {};

        if (searchName) params.name = searchName;
        caxios.get("/contacts", { params, withCredentials: true }).then(resp => {
            setContacts(prev => resp.data);
            setCurrentPage(1); // 검색 시 페이지 초기화
            setCheckedList([]);
            setAllChecked(false);
        });
    }

    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleContactsList();
    }, []);

    // 전체 체크박스를 클릭하면(true) 아래 체크박스 전체 적용
    useEffect(() => {
        if (contacts.length > 0 && checkedList.length === contacts.length) {
            setAllChecked(true);
        } else {
            setAllChecked(false);
        }
    }, [checkedList, contacts]);

    // 전체 체크박스 선택
    const handleAllcheckbox = () => {
        if (!allChecked) {
            setCheckedList(filteredContacts.map(contact => contact.seq));
            setAllChecked(true);
        } else {
            setCheckedList([]);
            setAllChecked(false);
        }
    }

    // 개별 체크박스 선택
    const handleSingleCheck = (seq) => {

        if (checkedList.includes(seq)) {
            setCheckedList(checkedList.filter(id => id !== seq));
        } else {
            setCheckedList([seq]); // 하나만 선택
        }
    }

    // 주소록 불러오기
    const handleAddContacts = () => {
        if (checkedList.length === 0) return;

        const selectedContacts = contacts
            .filter(contact => checkedList.includes(contact.seq))
            .map(contact => ({ email: contact.email, name: contact.name })); // 이메일 + 이름 객체

        onSelect(selectedContacts); // 배열 그대로 보내기
        setCheckedList([]);
        setAllChecked(false);
        onCancel();
    }

    const handleContactsOut = () => {
        onCancel();
    }

    // 현재 뷰에 따른 필터링된 주소록
    const filteredContacts = contacts.filter(contact => {
        if (view === "all") return true;
        return contact.type === view;
    });

    // 페이징 처리 (slice)
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setCheckedList([]);
        setAllChecked(false);
    };

    return (<div className={styles.container} style={{ fontSize: "20px", marginTop: "20px" }}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>

                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop} style={{ textAlign: "center" }}>

                    <button onClick={handleContactsAll} className={styles.headerbutton}>전체 주소록</button>
                    <button onClick={handleContactsSolo} className={styles.headerbutton}>개인 주소록</button>
                    <button onClick={handleContactsMulti} className={styles.headerbutton}>공유 주소록</button>
                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >

                    <input type="text" placeholder="주소록 성함" style={{ width: "81%", height: "50%", borderRadius: "5px", border: "none", justifyContent: "center" }}
                        onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { handleContactsList(); } }}></input>
                    <button onClick={handleContactsList}>검색</button>
                </div>

            </div> {/* 주소록 헤더  */}


            {/* 주소록 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody} style={{ marginTop: "20px" }}>
                <div className={styles.mainBodyHeader} style={{ fontSize: "20px" }}>
                    <div className={styles.mainBodycheckbox} >
                       선택
                    </div>
                    <div className={styles.mainBodytag}>성함</div>
                    <div className={styles.mainBodytag}>전화번호</div>
                    <div className={styles.mainBodytag}>이메일</div>
                    <div className={styles.mainBodytag}>부서</div>
                    <div className={styles.mainBodytag}>직위</div>
                    <br></br>

                </div>


                {/* 주소록 출력  */}

                <div className={styles.mainBodylist} style={{ fontSize: "18px" }}>

                    {view === "all" && currentContacts.map(e => // 전체출력
                        <div key={e.seq} >
                            <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                            <div className={styles.mainBodytag}>{e.name}</div>
                            <div className={styles.mainBodytag}>{e.phone}</div>
                            <div className={styles.mainBodytag}>
                                  {e.email.includes("@") ? e.email : `${e.email}@Infinity.com`}
                            </div>
                            <div className={styles.mainBodytag}>{e.job_code}</div>
                            <div className={styles.mainBodytag}>{e.rank_code}</div><br></br>
                            <hr style={{ clear: "both", border: "none", borderTop: "1px solid black", margin: "0.1px 0" }} />
                        </div>

                    )}


                    {view === "solo" && currentContacts
                        .filter(contact => contact.type === "solo") // 개인 주소록만
                        .map(e => (
                            <div key={e.seq}  >
                                <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                                <div className={styles.mainBodytag}>{e.name}</div>
                                <div className={styles.mainBodytag}>{e.phone}</div>
                                <div className={styles.mainBodytag}>{e.email}</div>
                                <div className={styles.mainBodytag}>{e.job_code}</div>
                                <div className={styles.mainBodytag}>{e.rank_code}</div><br></br>
                               <hr style={{ clear: "both", border: "none", borderTop: "1px solid black", margin: "0.1px 0" }} />
                            </div>
                        ))}

                    {view === "multi" && currentContacts
                        .filter(contact => contact.type === "multi") // 공용 주소록만
                        .map(e => (
                            <div key={e.seq} >
                                <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                                <div className={styles.mainBodytag}>{e.name}</div>
                                <div className={styles.mainBodytag}>{e.phone}</div>
                                <div className={styles.mainBodytag}>
                                  {e.email.includes("@") ? e.email : `${e.email}@Infinity.com`}
                                    </div>
                                <div className={styles.mainBodytag}>{e.job_code}</div>
                                <div className={styles.mainBodytag}>{e.rank_code}</div><br></br>
                              <hr style={{ clear: "both", border: "none", borderTop: "1px solid black", margin: "0.1px 0" }} />
                            </div>

                        ))}
                    <br></br>
                    {/* 페이징 추가 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredContacts.length}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>

                </div>



            </div>{/* 주소록 바디 */}

            {checkedList.length === 0 ? (
                <>
                    <button onClick={handleContactsOut} style={{ margin: "10px", float: "right" }}> 취소 </button>

                </>) : (
                <>

                    <button onClick={handleAddContacts} style={{ margin: "10px", float: "right" }}> 추가 </button>

                </>
            )}

        </div> {/* 메인 주소록창  */}


    </div>



    );
}

export default MailAddContacts;
