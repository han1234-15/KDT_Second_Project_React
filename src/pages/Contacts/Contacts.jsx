import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import ContactsAdd from "./ContactsAdd";
import ContactsAddMulti from "./ContactsAddMulti";
import { Pagination } from 'antd';

const Contacts = () => {

    const Navigate = useNavigate();

    const [contacts, setContacts] = useState([]); // 주소록 데이터 관리
    const [searchName, setSearchName] = useState(""); // 검색어 상태
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태


    // 페이지 이동
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 개인 주소록
    const handleContactsSolo = () => {
        Navigate("solo");
    }
    // 공유 주소록
    const handleContactsMulti = () => {
        Navigate("multi");
    }



    // 주소록 검색 +리스트 
    const handleContactsList = () => {
        const params = {};

        if (searchName) params.name = searchName;
        caxios.get("/contacts", { params, withCredentials: true }).then(resp => {
            setContacts(prev => resp.data);
        });
    }

    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleContactsList();
    }, []);

    // 주소록 삭제
    const handleContactsDelete = () => {
        caxios.delete("/contacts", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
            setContacts(prev => prev.filter(contact => !checkedList.includes(contact.seq)));
        });
    }





    // 공유 주소록으로 이동
    const handleContactsUpdateTypeMulti = () => {
        caxios.put("/contacts", { seqList: checkedList, type: "multi" }, { withCredentials: true })
            .then(resp => {
                setContacts(prev => prev.map(contact =>
                    checkedList.includes(contact.seq)
                        ? { ...contact, type: "multi" }
                        : contact
                ));
            });
    }

    // 개인 주소록으로 이동
    const handleContactsUpdateTypeSingle = () => {
        caxios.put("/contacts", { seqList: checkedList, type: "solo" }, { withCredentials: true })
            .then(resp => {
                setContacts(prev => prev.map(contact =>
                    checkedList.includes(contact.seq)
                        ? { ...contact, type: "solo" }
                        : contact
                ));
            });
    }

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
            // 모든 체크
            setCheckedList(contacts.map(contact => contact.seq));
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

    // modal

    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
    const [UpdateModalOpen, setUpdateModalOpen] = useState(false);


    const showModalSingleAdd = () => { // 개인 주소록 추가
        setIsSingleModalOpen(true);
    };
    const showModalMultiAdd = () => { // 공용 주소록 추가
        setIsMultiModalOpen(true);
    };
    const handleOk = () => { // 모달창 닫기
        setIsSingleModalOpen(false);
        setIsMultiModalOpen(false);
    };
    const handleCancel = () => { // 모달창 닫기
        setIsSingleModalOpen(false);
        setIsMultiModalOpen(false);
    };

    // 수정
    const [updateData, setUpdateData] = useState(
        { name: "", phone: "", email: "", job_code: "", rank_code: "" });

    const showUpdateModal = () => {
        if (checkedList.length === 1) {
            // 체크된 seq 가져오기
            const contactToUpdate = contacts.find(c => c.seq === checkedList[0]);
            if (contactToUpdate) {
                setUpdateData({
                    name: contactToUpdate.name,
                    phone: contactToUpdate.phone,
                    email: contactToUpdate.email,
                    job_code: contactToUpdate.job_code,
                    rank_code: contactToUpdate.rank_code
                });
            }
            setUpdateModalOpen(true);
        }else {
            alert("하나의 주소록 수정만 가능합니다!")
        }
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setUpdateData({ ...updateData, [name]: e.target.value })
    }

    const handleContactsUpdate = () => {
        caxios.put("/contacts/update", { dto: updateData, seqList: checkedList }, { withCredentials: true }
        ).then(resp => {
            setUpdateModalOpen(false);
        });
    };


    const handleContactsUpdateOut = () => {
        setUpdateModalOpen(false);
    }


    // 페이징용 currentMails
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentContacts = contacts.slice(indexOfFirst, indexOfLast);

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
                    {/* 전체 주소록 <br />
                    <button onClick={handleContactsSolo} className={styles.headerbutton}>개인 주소록</button>
                    <button onClick={handleContactsMulti} className={styles.headerbutton}>공용 주소록</button> */}
                    전체 주소록 : {contacts.length} 명 <br></br>
                    <button className={styles.createbtn} onClick={showModalSingleAdd}> 개인주소록 추가 </button>
                    <button className={styles.createbtn} onClick={showModalMultiAdd}> 공용주소록 추가 </button>

                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >
                    {checkedList.length === 0 ? (
                        <>
                            <input type="text" placeholder="검색할 주소록 이름" style={{ width: "50%", height: "50%", borderRadius: "5px", border: "none", justifyContent: "center" }}
                                onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") { handleContactsList();}}}></input>
                            <button onClick={handleContactsList}>검색</button>

                        </>) : (
                        <>
                            <button onClick={handleContactsDelete} style={{ margin: "10px" }}> 삭제 </button>
                            <button onClick={showUpdateModal} style={{ margin: "10px" }}> 수정 </button>
                            <button onClick={handleContactsUpdateTypeSingle} style={{ margin: "10px" }}> 개인 주소록으로 </button>
                            <button onClick={handleContactsUpdateTypeMulti} style={{ margin: "10px" }}> 공용 주소록으로 </button>

                        </>
                    )}
                </div>


            </div> {/* 주소록 헤더  */}
            <hr></hr>

            {/* 주소록 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody}>
                <div className={styles.mainBodyHeader}>
                    <div className={styles.mainBodycheckbox}><input type="checkbox" onClick={handleAllcheckbox} /></div>
                    <div className={styles.mainBodytag}>성함</div>
                    <div className={styles.mainBodytag}>전화번호</div>
                    <div className={styles.mainBodytag}>이메일</div>
                    <div className={styles.mainBodytag}>부서</div>
                    <div className={styles.mainBodytag}>직급</div><br></br>
                </div>
                <hr></hr>

                {/* 주소록 출력  */}
                <div className={styles.mainBodylist}>


                    {currentContacts.map(e =>
                        <div key={e.seq} className={styles.mainBodylistbox} >
                            <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                            <div className={styles.mainBodytag}>{e.name}</div>
                            <div className={styles.mainBodytag}>{e.phone}</div>
                            <div className={styles.mainBodytag}>{e.email}</div>
                            <div className={styles.mainBodytag}>{e.job_code}</div>
                            <div className={styles.mainBodytag}>{e.rank_code}</div><br></br>
                            <hr></hr>
                        </div>


                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={contacts.length}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>
                    {/* 개인 주소록 추가 modal */}
                    <Modal

                        centered={false}
                        open={isSingleModalOpen}
                        onCancel={() => setIsSingleModalOpen(false)}
                        footer={null}
                        destroyOnHidden

                        width={{
                            xs: '90%',  // 모바일
                            sm: '80%',
                            md: '70%',
                            lg: '60%',
                            xl: '50%',
                            xxl: '40%', // 큰 화면
                        }}
                        modalRender={modal => (
                            <div style={{ marginTop: '100px' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}

                    >
                        <ContactsAdd onClose={() => setIsSingleModalOpen(false)} />
                    </Modal>

                    {/* 공용 주소록 추가 modal */}
                    <Modal

                        centered={false}
                        open={isMultiModalOpen}
                        onCancel={() => setIsMultiModalOpen(false)}
                        footer={null}
                        destroyOnHidden
                        width={{
                            xs: '90%',
                            sm: '80%',
                            md: '70%',
                            lg: '60%',
                            xl: '50%',
                            xxl: '40%',
                        }}
                        modalRender={modal => (
                            <div style={{ marginTop: '100px' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <ContactsAddMulti onClose={() => setIsMultiModalOpen(false)} />
                    </Modal>

                    {/* 수정 modal */}
                    <Modal

                        centered={false}
                        open={UpdateModalOpen}
                        onCancel={() => setUpdateModalOpen(false)}
                        footer={null}
                        destroyOnHidden
                        width={{
                            xs: '90%',
                            sm: '80%',
                            md: '70%',
                            lg: '60%',
                            xl: '50%',
                            xxl: '40%',
                        }}
                        modalRender={modal => (
                            <div style={{ marginTop: '100px' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >

                        <div className={styles.mainHeader} style={{ fontSize: "40px", backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                            수정
                        </div>
                        <br></br>

                        <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                            <div className={styles.NewSharedMailbox1}>성함 : </div>
                            <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                                onChange={handleUpdateChange} value={updateData.name} name="name" />
                        </div>

                        <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                            <div className={styles.NewSharedMailbox1}>전화번호 : </div>
                            <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                                onChange={handleUpdateChange} value={updateData.phone} name="phone" />
                        </div>

                        <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                            <div className={styles.NewSharedMailbox1}>이메일 : </div>
                            <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                                onChange={handleUpdateChange} value={updateData.email} name="email" readOnly />
                        </div>
                        <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                            <div className={styles.NewSharedMailbox1}>부서 : </div>
                            <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                                onChange={handleUpdateChange} value={updateData.job_code} name="job_code" />
                        </div>
                        <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                            <div className={styles.NewSharedMailbox1}>직급 : </div>
                            <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                                onChange={handleUpdateChange} value={updateData.rank_code} name="rank_code" />
                        </div>

                        <button style={{ float: "right", marginLeft: "10px" }} onClick={handleContactsUpdateOut}>취소</button>
                        <button style={{ float: "right" }} onClick={handleContactsUpdate}>완료</button>

                    </Modal>

                </div>


            </div>{/* 주소록 바디 */}

        </div> {/* 메인 주소록창  */}


    </div>



    );
}

export default Contacts;