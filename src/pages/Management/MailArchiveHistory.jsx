import React, { useState } from "react";
import { Input, Select, Button, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./MailArchiveHistory.module.css";

const { Option } = Select;

const MailArchiveHistory = () => {
  const [form, setForm] = useState({
    worker: "",
    period: "지난 1년",
  });

  const [data, setData] = useState([
    {
      key: 1,
      date: "2025-10-15 16:51:11",
      worker: "CEO",
      ip: "125.130.125.92",
    },
    {
      key: 2,
      date: "2025-10-12 16:51:01",
      worker: "CEO",
      ip: "125.130.125.92",
    },
    {
      key: 3,
      date: "2025-10-09 12:51:51",
      worker: "CEO",
      ip: "125.130.125.92",
    },
  ]);

  const columns = [
    {
      title: "일시",
      dataIndex: "date",
      align: "center",
    },
    {
      title: "작업자",
      dataIndex: "worker",
      align: "center",
    },
    {
      title: "IP",
      dataIndex: "ip",
      align: "center",
    },
    {
      title: "상세",
      align: "center",
      render: () => (
        <Button className={styles.detailBtn}>상세 보기</Button>
      ),
    },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <div className={styles.row}>
          <label>작업자:</label>
          <Input
            placeholder="작업자 아이디 검색"
            value={form.worker}
            onChange={(e) => handleChange("worker", e.target.value)}
          />
          <label className={styles.periodLabel}>기간:</label>
          <Select
            value={form.period}
            style={{ width: 120 }}
            onChange={(v) => handleChange("period", v)}
          >
            <Option value="최근 1개월">최근 1개월</Option>
            <Option value="지난 1년">지난 1년</Option>
            <Option value="전체">전체</Option>
          </Select>
          <Button
            icon={<SearchOutlined />}
            className={styles.searchBtn}
            type="default"
          >
            검색
          </Button>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <span>보기 : 전체 ▽</span>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        className={styles.table}
      />

      <div className={styles.pagination}>
        <Button type="text">«</Button>
        <Button type="text">○</Button>
        <Button type="text">»</Button>
      </div>
    </div>
  );
};

export default MailArchiveHistory;
