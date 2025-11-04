import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import styles from "./BoardCategory/BoardAnnouncement.module.css";
import { caxios } from "../../config/config";
import { useNavigate, useLocation } from "react-router-dom";
import { color } from "framer-motion";

const { Search } = Input;

const BoardImportance = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  // 중요게시글 불러오기
  useEffect(() => {
    loadImportantPosts();
  }, []);

  const loadImportantPosts = () => {
    caxios
      .get("/board/important")
      .then((resp) => {
        const mapped = resp.data.map((item) => {
          const dateToShow = item.updatedAt || item.createdAt;
          const createdAt = new Date(dateToShow);
          const formattedDate = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(
            2,
            "0"
          )} ${String(createdAt.getHours()).padStart(2, "0")}:${String(
            createdAt.getMinutes()
          ).padStart(2, "0")}`;

          return {
            key: item.seq,
            tag: "중요",
            title: item.title,
            author: item.writer_id,
            date: formattedDate,
            importantYn: item.importantYn,
            hit: item.hit,
            noticeYn: item.noticeYn,
          };
        });
        setData(mapped);
      })
      .catch((err) => {
        console.error("중요게시글 불러오기 실패:", err);
      });
  };

    // 컬럼 정의
  const columns = [
    {
      title: <StarFilled style={{ color: "#fadb14", fontSize: "16px" }} />,
      key: "important", width: "10%",
      render: (_, record) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleImportant(record);
          }}
          style={{
            cursor: "pointer",
            color: record.importantYn === "Y" ? "#fadb14" : "#ccc",
            fontSize: "18px",
          }}
        >
          {record.importantYn === "Y" ? <StarFilled /> : <StarOutlined />}
        </span>
      ),
    },
    {
      title: "",
      dataIndex: "notice",
      key: "notice",
      width: "10%",
      render: (_, record) => (
        record.noticeYn === "Y" && (
          <span
            style={{
              backgroundColor: "#ffecb3",
              color: "#d48806",
              fontWeight: "bold",
              borderRadius: "4px",
              padding: "2px 6px",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            공지
          </span>
        )
      ),
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      width: "40%",
      align: "left",
      className: "col-title",
      render: (text) => (
        <span style={{ marginLeft: "15px" }}>{text}</span>
      ),
    },
    { title: "작성자", dataIndex: "author", key: "author", width: "20%" },
    { title: "조회수", dataIndex: "hit", key: "hit", width: "10%" },
    { title: "작성일", dataIndex: "date", key: "date", width: "20%" },
  ];

  // 중요 체크
  const handleImportant = async (record) => {
    try {
      await caxios.put(`/board/toggleImportant/${record.key}`);
      // 중요 해제 시 목록에서 제거
      setData((prev) => prev.filter((item) => item.key !== record.key));
    } catch (err) {
      console.error("중요 여부 변경 실패:", err);
    }
  };

  // 게시글 상세로 이동
  const handleRowClick = (record) => {
    navigate(`/board/detail/${record.key}`, {
      state: { from: location.pathname }, // 뒤로가기 시 돌아올 위치 저장
    });
  };

  // 검색 필터
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search
          placeholder="검색어를 입력하세요"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300, marginTop: 30, marginBottom: 5 }}
        />
      </div>

      <div className={styles.boardHeader}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            position: ["bottomCenter"],
            hideOnSinglePage: true,
            pageSizeOptions: ["5", "10", "20"],
            defaultPageSize: 10,
          }}
          rowClassName={() => styles.tableRow}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>
    </div>
  );
};

export default BoardImportance;
