import React, { useState } from "react";
import { Input, Select, Button, Table, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./MailArchive.module.css";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config";
import dayjs from "dayjs";

const { Option } = Select;

const MailArchive = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  // 메일 보기(클릭)
  const handleMailView = (mailItem) => {
    navigate("/mail/mailview", { state: { mail: mailItem } }); // 클릭 시 Mailview 페이지로 이동
  };

  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    target: "",
    receiver: "",
    keyword: "",
    period: "전체",
  });

  const [data, setData] = useState([]);

  const columns = [
    { title: "보낸 사람", dataIndex: "senderId", align: "center" },
    { title: "받는 사람", dataIndex: "recipientId", align: "center" },
    { title: "제목", dataIndex: "title", align: "center" },
    { title: "수신/발신 일시", dataIndex: "sendDate", align: "center" },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!form.target.trim() && !form.receiver.trim()) {
      alert("검색 대상 혹은 받는 대상을 입력해주세요.");
      return;
    }

    console.log(form);
    try {
      setLoading(true);

      // 검색 내역 남기기.
      await caxios.post("/mailArchive", {
        senderId: form.target,
        recipientId: form.receiver,
        keyword: form.keyword,
        period: form.period,
      });

      const res = await caxios.get("/mailArchive/search", {
        params: {
          target: form.target,
          receiver: form.receiver,
          keyword: form.keyword,
          period: form.period,
        },
      });

      // 각 created_at 포맷팅
      const formattedData = res.data.map(item => ({
        ...item,
        created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
      }));


      setData(formattedData);
      console.log(res.data);
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
            placeholder="아이디 검색"
            value={form.target}
            onChange={(e) => handleChange("target", e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <label>받는 대상:</label>
          <Input
            placeholder="받는 사람 아이디 입력"
            value={form.receiver}
            onChange={(e) => handleChange("receiver", e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <label>검색 내용:</label>

          <Input
            placeholder="검색어 입력"
            className={styles.keywordInput}
            value={form.keyword}
            onChange={(e) => handleChange("keyword", e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <label>기간:</label>
          <Select
            value={form.period}
            style={{ width: 120 }}
            onChange={(v) => handleChange("period", v)}
          >
            <Option value="전체">전체</Option>
            <Option value="최근 3개월">최근 3개월</Option>
            <Option value="최근 6개월">최근 6개월</Option>
            <Option value="최근 1년">최근 1년</Option>
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
        tableLayout="fixed"
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: 10,
          onChange: (page) => {
            setCurrentPage(page);
          },
          showTotal: (total) => `총 ${total}건`,
        }}
        onRow={(record) => ({
          onClick: () => {
            console.log(record);
            handleMailView(record);
          },
          style: { cursor: 'pointer' }, // 마우스 올렸을 때 포인터
        })}
      />
    </div>
  );
};

export default MailArchive;