import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal, Table, Input } from 'antd'; // ✅ Input(Search) 사용
import ContactsAdd from "./ContactsAdd";
import ContactsAddMulti from "./ContactsAddMulti";

const { Search } = Input; // ✅ Search 컴포넌트 구조분해

const Contacts = () => {

    const Navigate = useNavigate();

    const [contacts, setContacts] = useState([]); // 주소록 데이터 관리
    const [searchName, setSearchName] = useState(""); // 검색어 상태
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

    // 개인 주소록
    const handleContactsSolo = () => {
        Navigate("solo");
    }
    // 공유 주소록
    const handleContactsMulti = () => {
        Navigate("multi");
    }

    // 주소록 검색 + 리스트
    const handleContactsList = () => {
        const params = {};
        if (searchName) params.name = searchName;
        caxios.get("/contacts", { params, withCredentials: true }).then(resp => {
            setContacts(resp.data);
        });
    }

    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleContactsList();
    }, []);

    // 주소록 삭제
    const handleContactsDelete = () => {
        caxios.delete("/contacts", { data: { seqList: checkedList }, withCredentials: true })
            .then(resp => {
                setContacts(prev => prev.filter(contact => !checkedList.includes(contact.seq)));
            });
        setCheckedList([]);
        setAllChecked(false);
        handleContactsList();
    }

    // 공유 주소록으로 이동
    const handleContactsUpdateTypeMulti = async () => {
        await caxios.put("/contacts", { seqList: checkedList, type: "multi" }, { withCredentials: true });
        setCheckedList([]);
        setAllChecked(false);
        handleContactsList();
    }
    //내 개인 주소록으로 복사
    const handleCopyToSolo = async () => {
        await caxios.put("/contacts/toSoloCopy",
            { seqList: checkedList },
            { withCredentials: true }
        );

        setCheckedList([]);
        handleContactsList(); // 리스트 새로고침
    };



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

    // 수정
    const [updateData, setUpdateData] = useState(
        { name: "", phone: "", email: "", job_code: "", rank_code: "" });

    const showUpdateModal = () => {
        if (checkedList.length === 1) {
            const contactToUpdate = contacts.find(c => c.seq == checkedList[0]);
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
        setUpdateData({ ...updateData, [name]: value })
    }

    const handleContactsUpdate = () => {

        //레직스
        const name = updateData.name.trim();
        let phone = updateData.phone.trim();

        const nameRegex = /^[가-힣a-zA-Z\s]{2,6}$/;
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!nameRegex.test(name)) {
            alert("이름에는 숫자나 특수문자를 포함할 수 없습니다 (최소 2글자 ~ 최대 6글자).");
            return;
        }

        if (!phoneRegex.test(phone)) {
            alert("전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678");
            return;
        }

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

    // 메일 쓰기
    const handleMail = () => {
        if (checkedList.length === 1) {
            const selectedContacts = contacts.filter(c => checkedList.includes(c.seq));
            Navigate("/mail/mailwrite", { state: { selectedContacts } });
        } else {
            alert("1명의 수신인을 선택해주세요.");
        }
    };

    return (
        <div className={styles.container}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>
                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop}>
                    전체 주소록 : {contacts.length} 명
                </div>
                <div className={styles.addBtns}>
                    <button className={styles.createbtn} onClick={showModalSingleAdd}> + 개인주소록</button>
                    <button className={styles.createbtn} onClick={showModalMultiAdd}> + 공용주소록</button>
                </div>
            </div>

            {/* 주소록 헤더 2 */}
            <div className={styles.mainHeaderbottom}>
                {checkedList.length === 0 ? (
                    <>
                        {/* ✅ Ant Design Search로 변경 */}
                        <div className={styles.searchBox}>
                        <Search
                            placeholder="검색할 이름을 입력하세요"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onSearch={handleContactsList}
                            enterButton="검색"
                            style={{ width: "400px"  }}
                        />
                         </div>
                    </>
                ) : (
                    <>
                    <div className={styles.btnBox}>
                        <button className={styles.btns} onClick={handleContactsDelete} > 삭제 </button>
                        <button className={styles.btns} onClick={showUpdateModal} > 수정 </button>
                        <button className={styles.btns} onClick={handleCopyToSolo} > 개인주소록에 복사 </button>
                        <button className={styles.btns} onClick={handleContactsUpdateTypeMulti} > 공용 주소록으로 이동 </button>
                        <button className={styles.btns} onClick={handleMail} > 메일 쓰기 </button>
                        </div>
                    </>
                )}
            </div>

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
                open={isSingleModalOpen}
                onCancel={() => setIsSingleModalOpen(false)}
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
                modalRender={modal => <div style={{ marginTop: '100px' }}>{modal}</div>}
            >
                <ContactsAdd onClose={() => setIsSingleModalOpen(false)} handleContactsList={handleContactsList} />
            </Modal>

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
                modalRender={modal => <div style={{ marginTop: '100px' }}>{modal}</div>}
            >
                <ContactsAddMulti onClose={() => setIsMultiModalOpen(false)} handleContactsList={handleContactsList} />
            </Modal>

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
                modalRender={modal => <div style={{ marginTop: '100px' }}>{modal}</div>}
            >
                <div className={styles.mainHeader} style={{ fontSize: "40px", textAlign: "center" }}>수정</div>
                <br />
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>성함  </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px" }}
                        onChange={handleUpdateChange} value={updateData.name} name="name" />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>전화번호  </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px" }}
                        onChange={handleUpdateChange} value={updateData.phone} name="phone" />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>이메일  </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px" }}
                        onChange={handleUpdateChange}
                        value={updateData.email.includes("@") ? updateData.email : `${updateData.email}@Infinity.com`} name="email" readOnly />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>부서  </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px" }} onChange={handleUpdateChange} value={updateData.job_code} name="job_code" />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "30px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>직위  </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px" }} onChange={handleUpdateChange} value={updateData.rank_code} name="rank_code" />
                </div>
                <button className={styles.btns} style={{ float: "right", marginLeft: "30px" }} onClick={handleContactsUpdateOut}>취소</button>
                <button className={styles.btns} style={{ float: "right", marginLeft: "10px" }} onClick={handleContactsUpdate}>완료</button>
            </Modal>
        </div>
    );
}

export default Contacts;
