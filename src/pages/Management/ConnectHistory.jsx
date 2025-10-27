import React, { useEffect, useState } from "react";
import { Table } from "antd";
import styles from "./ConnectHistory.module.css";
import { caxios } from "../../config/config";

const ConnectHistory = () => {
    const [logs, setLogs] = useState([]);

    //  검색 조건 상태
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        userId: "",
        ip: "",
    });

    // 데이터 불러오기 
    useEffect(() => {
        fetchLogs();
    }, []);

    // 공통 조회 함수
    const fetchLogs = (params = {}) => {
        caxios
            .get("/log/search", { params }) // ✅ params 객체로 전달
            .then((resp) => setLogs(resp.data))
            .catch((err) => console.error(err));
    };


    // 🔍 검색 버튼 클릭
    const handleSearch = () => {
        fetchLogs({
            startDate: filters.startDate,
            endDate: filters.endDate,
            userId: filters.userId,
            ip: filters.ip,
        });
    };

    const columns = [
        { title: "접속 일시", dataIndex: "login_time", align: "center" },
        { title: "접속자", dataIndex: "user_id", align: "center" },
        { title: "접속 경로", dataIndex: "channel", align: "center" },
        { title: "IP", dataIndex: "ip_address", align: "center" },
    ];

    return (
        <div className={styles.container}>

            <div className={styles.filterArea}>
                <div className={styles.filterItem}>
                    <label>조회 기간</label>
                    <input type="date" /> - <input type="date" />
                </div>
                <div className={styles.filterItem}>
                    <label>접속자 ID</label>
                    <input type="text" placeholder="ex) yujung" />
                </div>
                <div className={styles.filterItem2}>
                    <label>IP</label>
                    <input type="text" placeholder="예: 221.152.27.168" />
                </div>
                <button className={styles.searchBtn}>검색</button>
            </div>

            <div className={styles.tableWrap}>
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="log_id"
                    pagination={{ pageSize: 5 }}
                />
            </div>
        </div>
    );
};

export default ConnectHistory;