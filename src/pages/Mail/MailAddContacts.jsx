import styles from "./Mail.module.css";
import { useEffect, useState } from "react";
import { caxios } from "../../config/config.js";
import { Button, Input, Table, Pagination } from "antd";
const { Search } = Input;

const MailAddContacts = ({ onSelect, onCancel }) => {
    const [contacts, setContacts] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [checkedList, setCheckedList] = useState([]);
    const [view, setView] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    // ✅ 주소록 조회
    const handleContactsList = () => {
        const params = {};
        if (view !== "all") params.type = view;
        if (searchName) params.name = searchName;

        caxios
            .get("/contacts", { params })
            .then((resp) => {
                setContacts(resp.data || []);
                setCheckedList([]);
            })
            .catch((err) => console.error("주소록 불러오기 실패:", err));
    };

    useEffect(() => {
        handleContactsList();
    }, [view]);

    // ✅ 테이블 컬럼 정의
    const columns = [
        { title: "성함", dataIndex: "name", key: "name", align: "center" },
        { title: "전화번호", dataIndex: "phone", key: "phone", align: "center" },
        {
            title: "이메일",
            dataIndex: "email",
            key: "email",
            align: "center",
            render: (text) => (text.includes("@") ? text : `${text}@Infinity.com`),
        },
        { title: "부서", dataIndex: "job_code", key: "job_code", align: "center" },
        { title: "직위", dataIndex: "rank_code", key: "rank_code", align: "center" },
    ];

    // ✅ 여러명 선택 가능 (checkbox)
    const rowSelection = {
        selectedRowKeys: checkedList,
        onChange: (selectedRowKeys) => setCheckedList(selectedRowKeys),
        type: "checkbox", // ✅ 멀티 선택
    };

    // ✅ 테이블 표시용 데이터
    const filteredContacts = contacts.filter((c) =>
        view === "all" ? true : c.type === view
    );

    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);

    // ✅ 추가 버튼 클릭 시
    const handleAddContacts = () => {
        if (checkedList.length === 0) return;
        const selected = contacts.filter((c) => checkedList.includes(c.seq));
        const selectedContacts = selected.map((c) => ({
            email: c.email,
            name: c.name,
        }));
        onSelect(selectedContacts);
        setCheckedList([]);
        onCancel();
    };

    return (
        <div className={styles.container} style={{ fontSize: "18px" }}>
            <div className={styles.main}>
                {/* 필터 버튼 */}
                <div 
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                        marginBottom: "15px",
                    }}
                >
                    <Button className={styles.routerBtn}
                        type={view === "all" ? "primary" : "default"}
                        onClick={() => setView("all")}
                    >
                        전체
                    </Button>
                    <Button className={styles.routerBtn}
                        type={view === "solo" ? "primary" : "default"}
                        onClick={() => setView("solo")}
                    >
                        개인
                    </Button> 
                    <Button className={styles.routerBtn}
                        type={view === "multi" ? "primary" : "default"}
                        onClick={() => setView("multi")}
                    >
                        공용
                    </Button>
                </div>

                {/* 검색창 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "10px",
                    }}
                >
                    <Search
                        placeholder="주소록 이름 검색"
                        allowClear
                        onSearch={handleContactsList}
                        onChange={(e) => setSearchName(e.target.value)}
                        style={{ width: "80%", maxWidth: "400px", display: "flex", justifyItems: "flex-end" }}
                    />
                </div>

                {/* ✅ 테이블 */}
                <Table
                    rowKey="seq"
                    columns={columns}
                    dataSource={currentContacts}
                    rowSelection={rowSelection}
                    pagination={false}
                    bordered
                    size="middle"
                    style={{ background: "#fff", borderRadius: "8px" }}
                />

                {/* ✅ 페이지네이션 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "15px",
                    }}
                >
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredContacts.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                    />
                </div>

                <div className={styles.footerBtns}>
                    <Button onClick={onCancel} style={{borderColor:"red"}}>취소</Button>
                    <Button
                        type="primary"
                        onClick={handleAddContacts}
                        disabled={checkedList.length === 0}
                    >
                        추가 ({checkedList.length})
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MailAddContacts;
