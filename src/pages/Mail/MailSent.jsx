import styles from "./Mail.module.css";
import { useNavigate } from "react-router-dom";
import { caxios } from '../../config/config.js';
import { useEffect, useState } from 'react';
import { Table } from 'antd';

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
    const handleMailWrite = () => navigate("/mail/mailwrite");

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

    // 메일 보기(클릭)
    const handleMailView = (mailItem) => {
        navigate("/mail/mailview", { state: { mail: mailItem, Mailres: true } }); // 클릭 시 Mailview 페이지로 이동
    };

    // 메일 삭제
    const handleMailDelete = () => {
        caxios.delete("/mail", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
            setMail(prev => prev.filter(mail => !checkedList.includes(mail.seq)));
        });
        setCheckedList([]);
        setAllChecked(false);
        handleMailList();
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setCheckedList([]);
        setAllChecked(false);
    };

    // Table rowSelection + 전체선택/해제 기능
    const rowSelection = {
        selectedRowKeys: checkedList,
        onChange: (selectedKeys) => setCheckedList(selectedKeys)

    };

    return (
        <div className={styles.container}>

            {/* 메인 메일창 */}
            <div className={styles.main}>

                {/* 메일 헤더 */}
                <div className={styles.mainHeader}>

                    {/* 메일 헤더 1 */}
                    <div className={styles.mainHeadertop}>
                        보낸 메일 : {mail.length}개의 메일 <br />
                        <button onClick={handleMailWrite} className={styles.createbtn}>메일쓰기</button>
                    </div>

                    {/* 메일 헤더 2 */}
                    <div className={styles.mainHeaderbottom}>
                        {checkedList.length === 0 ? (
                            <>
                                <input type="text" placeholder="검색할 수신자 이름"
                                    style={{ width: "50%", height: "50%", borderRadius: "5px", border: "1px solid lightgrey", fontSize: "20px" }}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleMailList(); }} />
                                <button onClick={handleMailList}>검색</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleMailDelete} style={{ margin: "10px" }}>삭제</button>
                            </>
                        )}
                    </div>

                </div> {/* 메일 헤더 */}

                {/* 기존 div map 대신 Ant Design Table */}
                <Table
                    rowSelection={rowSelection} // 체크박스 기능
                    columns={[
                        { title: "수신자", dataIndex: "recipientName", key: "recipientName" },
                        {
                            title: "수신자 이메일", dataIndex: "recipientId", key: "recipientId",
                            render: (recipientId) => recipientId.includes('@') ? recipientId : `${recipientId}@Infinity.com`
                        },

                        { title: "제목", dataIndex: "title", key: "title" },
                        { title: "발신 날짜", dataIndex: "sendDateStr", key: "sendDateStr" },
                    ]}
                    dataSource={mail.map(m => ({ ...m, key: m.seq }))}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: mail.length,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                        position: ["bottomCenter"],
                    }}
                    onRow={(record) => ({
                        onClick: () => handleMailView(record),
                        style: { cursor: 'pointer' }, // 여기가 포인터
                    })}
                />

            </div> {/* 메인 메일창 */}

        </div>
    )
}

export default MailSent;
