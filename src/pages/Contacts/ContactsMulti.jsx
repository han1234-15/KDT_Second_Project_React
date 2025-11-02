import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate, useLocation } from "react-router-dom";
import ContactsAddMulti from "./ContactsAddMulti";
import ContentTap from "../Common/ContentTap";
import { Button, Flex, Modal } from 'antd';
import { Table, Pagination } from 'antd';

const ContactsMulti = () => {


    const location = useLocation();
    const Navigate = useNavigate();

    const [contacts, setContacts] = useState([]); // 주소록 데이터 관리
    const [searchName, setSearchName] = useState(""); // 검색어 상태
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

    // // 페이지 이동
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize, setPageSize] = useState(10);

    // // 페이징용 currentMails
    // const indexOfLast = currentPage * pageSize;
    // const indexOfFirst = indexOfLast - pageSize;
    // const currentContacts = contacts.slice(indexOfFirst, indexOfLast);

    // const handlePageChange = (page) => {
    //     setCurrentPage(page);
    //     setAllChecked(false);
    //     setCheckedList([]);
    // };


    // 페이지 이동
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 페이징용 currentContacts
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentContacts = contacts.slice(indexOfFirst, indexOfLast);

    // Ant Design Table rowSelection
    const rowSelection = {
        selectedRowKeys: checkedList, // checkedList와 동기화
        onChange: (selectedKeys) => {
            setCheckedList(selectedKeys);
            setAllChecked(selectedKeys.length === contacts.length);
        },
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setAllChecked(false);
        setCheckedList([]);
    };


    // 전체 주소록
    const handleContacts = () => {
        Navigate("/contacts");
    }
    // 개인 주소록
    const handleContactsSolo = () => {
        Navigate("/contacts/solo");
    }

    // 주소록 삭제
    const handleContactsDelete = () => {
        caxios.delete("/contacts", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
            setContacts(prev => prev.filter(contact => !checkedList.includes(contact.seq)));
        });
        setCheckedList([]);
        setAllChecked(false);
        handleContactsList();
    }

    // 내 개인 주소록으로 복사
    // const handleCopyToSolo = async () => {
    //     await caxios.put("/contacts/toSoloCopy",
    //         { seqList: checkedList },
    //         { withCredentials: true }
    //     );

    //     setCheckedList([]);
    //     handleContactsList(); // 리스트 새로고침
    // };

    // 개인 주소록으로 이동
    const handleContactsUpdateTypeSingle = async () => {
        await caxios.put("/contacts", { seqList: checkedList, type: "solo" }, { withCredentials: true });

        setCheckedList([]);
        setAllChecked(false);
        handleContactsList();
    }

    // 전체 체크박스를 클릭하면(true) 아래 체크박스 전체 적용
    useEffect(() => {
        if (currentContacts.length > 0 && checkedList.length === currentContacts.length) {
            setAllChecked(true);
        } else {
            setAllChecked(false);
        }
    }, [checkedList, currentContacts]);



    // 전체 체크박스 선택
    const handleAllcheckbox = () => {
        if (!allChecked) {
            // 모든 체크
            setCheckedList(currentContacts.map(contact => contact.seq));
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



    // 주소록 검색 +리스트 
    const handleContactsList = () => {
        const params = {};
        if (searchName) params.name = searchName;
        caxios.get("/contacts?type=multi", { params, withCredentials: true }).then(resp => {
            setContacts(prev => resp.data);
        });
    }



    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleContactsList();
    }, []);



    // modal


    const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
    const [UpdateModalOpen, setUpdateModalOpen] = useState(false);



    const showModalMultiAdd = () => { // 공용 주소록 추가
        setIsMultiModalOpen(true);
    };
    const handleOk = () => { // 모달창 닫기

        setIsMultiModalOpen(false);
    };
    const handleCancel = () => { // 모달창 닫기

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

        } else {
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
            setCheckedList([]);
            setAllChecked(false);
            handleContactsList();
        });
    };

    const handleContactsUpdateOut = () => {
        setUpdateModalOpen(false);
    }


    // 메일 쓰기

    const handleMail = () => {
        if (checkedList.length === 1) {
            const selectedContacts = contacts.filter(c => checkedList.includes(c.seq));
            Navigate("/mail/mailwrite", { state: { selectedContacts } });
        } else {
            alert("1명의 수신인을 선택해주세요.");
        }
    };




    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>



                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop} >

                    공용 주소록 : {contacts.length} 명 <br></br>
                    {/* <button onClick={handleContacts} className={styles.headerbutton}>전체 주소록</button>
                    <button onClick={handleContactsSolo} className={styles.headerbutton}>개인 주소록</button> */}
                    <button className={styles.createbtn} onClick={showModalMultiAdd}> 공용 주소록 추가 </button>

                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >
                    {checkedList.length === 0 ? (
                        <>
                            <input type="text" placeholder="검색할 주소록 성함"
                                style={{ width: "50%", height: "50%", borderRadius: "5px", border: "1px solid lightgrey", justifyContent: "center", fontSize: "20px" }}
                                onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { handleContactsList(); } }}></input>
                            <button onClick={handleContactsList}>검색</button>

                        </>) : (
                        <>

                            <button onClick={handleContactsDelete} style={{ margin: "10px" }}> 삭제 </button>
                            <button onClick={showUpdateModal} style={{ margin: "10px" }}> 수정 </button>
                            <button onClick={handleContactsUpdateTypeSingle} style={{ margin: "10px" }}> 개인 주소록으로 이동</button>
                            <button onClick={handleMail} style={{ margin: "10px" }}> 메일쓰기 </button>

                        </>
                    )}
                </div>


            </div> {/* 주소록 헤더  */}
            {/* 주소록 헤더  */}

            {/* Ant Design Table */}

            <Table
                rowSelection={rowSelection}
                columns={[
                    { title: "성함", dataIndex: "name", key: "name" },
                    { title: "전화번호", dataIndex: "phone", key: "phone" },
                    {
                        title: "이메일", dataIndex: "email", key: "email",
                        render: (email) => email.includes('@') ? email : `${email}@Infinity.com`
                    },
                    { title: "부서", dataIndex: "job_code", key: "job_code" },
                    { title: "직위", dataIndex: "rank_code", key: "rank_code" },
                ]}
                dataSource={contacts.map(c => ({ ...c, key: c.seq }))}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: contacts.length,
                    onChange: handlePageChange,
                    showSizeChanger: false,
                    position: ["bottomCenter"],
                    hideOnSinglePage: true,
                }}

            />


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
                <ContactsAddMulti onClose={() => setIsMultiModalOpen(false)} handleContactsList={handleContactsList} />
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

                <div className={styles.mainHeader} style={{ fontSize: "40px", textAlign: "center" }}>
                    수정
                </div>
                <br></br>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>성함  </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handleUpdateChange} value={updateData.name} name="name" />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px", }}>전화번호  </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handleUpdateChange} value={updateData.phone} name="phone" />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>이메일  </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handleUpdateChange}
                        value={updateData.email.includes("@") ? updateData.email : `${updateData.email}@Infinity.com`} name="email" readOnly />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>부서  </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handleUpdateChange} value={updateData.job_code} name="job_code" />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>직위  </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handleUpdateChange} value={updateData.rank_code} name="rank_code" />
                </div>


                <button style={{ float: "right", marginLeft: "30px" }} onClick={handleContactsUpdateOut}>취소</button>
                <button style={{ float: "right", marginLeft: "10px" }} onClick={handleContactsUpdate}>완료</button>

            </Modal>
        </div>


    </div>




    );
}

export default ContactsMulti;