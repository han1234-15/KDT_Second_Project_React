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


    // 검색 버튼 클릭
    const handleSearch = () => {
        fetchLogs({
            startDate: filters.startDate,
            endDate: filters.endDate,
            userId: filters.userId,
            ip: filters.ip,
        });
    };

    // 초기화 버튼 클릭
    const handleClear = () => {
        setFilters({
            startDate: "",
            endDate: "",
            userId: "",
            ip: "",
        });
        fetchLogs();
    };

    // input 값 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const columns = [
        { title: "접속 일시", dataIndex: "login_time", align: "center" },
        { title: "접속자", dataIndex: "user_id", align: "center" },
        { title: "상태", dataIndex: "state", align: "center" },
        { title: "접속 경로", dataIndex: "channel", align: "center" },
        { title: "운영체제", dataIndex: "os", align: "center" },
        { title: "브라우저", dataIndex: "browser", align: "center" },
        { title: "IP", dataIndex: "ip_address", align: "center" },
    ];

    return (
        <div className={styles.container}>

            <div className={styles.filterArea}>
                <div className={styles.filterItem}>
                    <label>조회 기간</label>
                    <input type="date" name="startDate"
                        value={filters.startDate}
                        onChange={handleChange} /> - <input type="date" name="endDate"
                            value={filters.endDate}
                            onChange={handleChange} />
                </div>
                <div className={styles.filterItem}>
                    <label>접속자 ID</label>
                    <input type="text" name="userId"
                        placeholder="ex) yujung"
                        value={filters.userId}
                        onChange={handleChange} />
                </div>
                <div className={styles.filterItem2}>
                    <label>IP</label>
                    <input type="text" name="ip"
                        placeholder="예: 221.152.27.168"
                        value={filters.ip}
                        onChange={handleChange} />
                </div>
                <button className={styles.searchBtn} onClick={handleSearch}>검색</button>
                <button className={styles.searchBtn} onClick={handleClear}>초기화</button>
            </div>

            <div className={styles.tableWrap}>
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="log_id"
                    pagination={{ pageSize: 15 }}
                />
            </div>
        </div>
    );
};

export default ConnectHistory;