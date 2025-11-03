import React, { useState } from "react";
import { Input, Select, Button, Table, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./MailArchive.module.css";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config";

const { Option } = Select;

const MailArchive = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    target: "",
    receiver: "",
    keyword: "",
    period: "최근 1개월",
  });

  const [data, setData] = useState([]);

  const columns = [
    { title: "보낸 사람", dataIndex: "sender", align: "center" },
    { title: "받는 사람", dataIndex: "receiver", align: "center" },
    { title: "제목", dataIndex: "title", align: "center" },
    { title: "수신/발신 일시", dataIndex: "date", align: "center" },
    { title: "메모", dataIndex: "memo", align: "center" },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await caxios.get("/mail/archive/search", {
        params: {
          target: form.target,
          receiver: form.receiver,
          keyword: form.keyword,
          period: form.period,
        },
      });
      setData(res.data);
      if (res.data.length === 0) message.info("검색 결과가 없습니다.");
    } catch (err) {
      console.error(err);
      message.error("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <div
          onClick={() => navigate("/management/archive/search")}
          className={styles.subTabActive}
        >
          검색
        </div>
        <div
          onClick={() => navigate("/management/archive/history")}
          className={styles.subTab}
        >
          검색내역
        </div>
      </div>

      {/* 검색 조건 */}
      <div className={styles.searchBox}>
        <div className={styles.row}>
          <label>검색 대상:</label>
          <Input
            placeholder="이름, 아이디 검색"
            value={form.target}
            onChange={(e) => handleChange("target", e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <label>받는 사람:</label>
          <Input
            placeholder="받는 사람 주소 입력"
            value={form.receiver}
            onChange={(e) => handleChange("receiver", e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <label>검색 내용:</label>
          <Select
            value="전체"
            style={{ width: 100 }}
            onChange={(v) => handleChange("keyword", v)}
          >
            <Option value="전체">전체</Option>
            <Option value="보낸 메일">보낸 메일</Option>
            <Option value="받은 메일">받은 메일</Option>
          </Select>
          <Input
            placeholder="검색어 입력"
            className={styles.keywordInput}
            value={form.keyword}
            onChange={(e) => handleChange("keyword", e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className={styles.row}>
          <label>기간:</label>
          <Select
            value={form.period}
            style={{ width: 120 }}
            onChange={(v) => handleChange("period", v)}
          >
            <Option value="최근 1개월">최근 1개월</Option>
            <Option value="최근 3개월">최근 3개월</Option>
            <Option value="최근 6개월">최근 6개월</Option>
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            className={styles.searchBtn}
            onClick={handleSearch}
            loading={loading}
          >
            검색
          </Button>
        </div>
      </div>

      {/* 결과 테이블 */}
      <Table
        className={styles.table}
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        loading={loading}
      />
    </div>
  );
};

export default MailArchive;