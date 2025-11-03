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
            title: item.title,
            author: item.writer_id,
            date: formattedDate,
            importantYn: item.importantYn,
          };
        });
        setData(mapped);
      })
      .catch((err) => {
        console.error("중요게시글 불러오기 실패:", err);
      });
  };

  // ⭐ 중요 표시 토글
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

  // 컬럼 정의
  const columns = [
    {
      title: <StarFilled style={{ color: "#fadb14", fontSize: "16px" }} />,
      key: "important",
      render: (_, record) => (
        <span
          onClick={(e) => {
            e.stopPropagation(); // ⭐ 클릭 시 행 클릭 이벤트 막기
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
    { title: "제목", dataIndex: "title", key: "title" },
    { title: "작성자", dataIndex: "author", key: "author" },
    { title: "작성일", dataIndex: "date", key: "date" },
  ];

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
          style={{ width: 300 , marginTop: 30 , marginBottom: 5}}
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
          // ✅ 행 클릭 시 게시글 상세 이동
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>
    </div>
  );
};

export default BoardImportance;
