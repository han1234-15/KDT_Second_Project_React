import React, { useState, useEffect } from "react";
import { Input, Select, Button, Table, message, Modal, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./MailArchiveHistory.module.css";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config";
import dayjs from 'dayjs';


const { Option } = Select;

const MailArchiveHistory = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    worker: "",
    period: "최근 6개월",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const columns = [
    { title: "일시", dataIndex: "created_at", align: "center" },
    { title: "작업자", dataIndex: "managerId", align: "center" },
    { title: "IP", dataIndex: "managerIp", align: "center" },
    {
      title: "상세",
      align: "center",
      render: (_, record) => (
        <Button
          className={styles.detailBtn}
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
        >
          상세 보기
        </Button>
      ),
    },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 검색 함수
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await caxios.get("/mailArchive/history", {
        params: {
          worker: form.worker,
          period: form.period,
        },
      });

      // 각 created_at 포맷팅
      const formattedData = res.data.map(item => ({
        ...item,
        created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
      }));

      setData(formattedData);
      console.log(formattedData);

      if (res.data.length === 0) message.info("검색 결과가 없습니다.");
    } catch (err) {
      console.error(err);
      message.error("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 전체 내역 불러오기
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <div
          onClick={() => navigate("/management/archive/search")}
          className={styles.subTab}
        >
          검색
        </div>
        <div
          onClick={() => navigate("/management/archive/history")}
          className={styles.subTabActive}
        >
          검색내역
        </div>
      </div>

      <div className={styles.searchBox}>
        <div className={styles.row}>
          <label>작업자</label>
          <Input
            placeholder="작업자 아이디 검색"
            value={form.worker}
            onChange={(e) => handleChange("worker", e.target.value)}
          />
          <label className={styles.periodLabel}>기간</label>
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
            icon={<SearchOutlined />}
            className={styles.searchBtn}
            type="default"
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}

        className={styles.table}
        loading={loading}
      />

      {/* 상세보기 모달 */}
      <Modal
        title={<div style={{ fontSize: "26px", padding: "10px" }}>상세 정보</div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            닫기
          </Button>
        ]}
        style={{ marginTop: "10%" }}
        width={400} // 원하는 픽셀 값으로 조절 가능
      >
        {selectedRecord ? (
          <div className={styles.detailInfo}>
            <p style={{ marginTop: "20px" }}><strong>작업자</strong>{selectedRecord.managerId}</p>
            <p><strong>IP</strong>{selectedRecord.managerIp}</p>
            <p style={{ marginBottom: "20px" }}><strong>일시</strong>{selectedRecord.created_at}</p>
            <hr></hr>
            <p style={{ fontSize: "20px", marginTop: "25px", marginLeft: "20px" }}><strong>검색 조건</strong></p>
            <p style={{ marginTop: "10px" }}><strong>보낸 사람</strong>{selectedRecord.senderId}</p>
            <p><strong>받는 사람</strong>{selectedRecord.recipientId}</p>
            <p><strong>키워드</strong>{selectedRecord.keyword}</p>
            <p><strong>기간</strong>{selectedRecord.period}</p>
          </div>
        ) : (
          <p>데이터가 없습니다.</p>
        )}
      </Modal>
    </div>
  );
};

export default MailArchiveHistory;
