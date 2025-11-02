import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import styles from "./BoardAnnouncement.module.css";
import { caxios } from "../../../config/config";
import { useLocation, useNavigate } from "react-router-dom";
const { Search } = Input;

const BoardFreedom = () => {

  const navigate = useNavigate();
  const handleRowClick = (record) => {
    navigate(`/board/detail/${record.key}`, {
      state: { from: useLocation.pathname } // ✅ 현재 경로 저장
    });
  };

  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data, setData] = useState([]);

  // 자유게시판(category_id = 2) 데이터 불러오기
  useEffect(() => {
    caxios
      .get("/board/category/2") // category_id = 2 (자유게시판)
      .then((resp) => {
        console.log("게시글 목록:", resp.data);

        const mapped = resp.data.map((item) => {
          //수정일
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
            tag: "자유",
            title: item.title,
            author: item.writer_id,
            date: formattedDate, // 작성일 or 수정일
          };
        });

        setData(mapped);
      })
      .catch((err) => {
        console.error("게시글 목록 불러오기 실패:", err);
      });
  }, []);

  // 컬럼 정의
  const columns = [
    { title: "태그", dataIndex: "tag", key: "tag" },
    { title: "제목", dataIndex: "title", key: "title" },
    { title: "작성자", dataIndex: "author", key: "author" },
    { title: "작성날짜", dataIndex: "date", key: "date" },
  ];

  // 페이지 변경 시 실행 함수
  const handlePageChange = (page, pageSize) => {
    console.log("현재 페이지:", page);
    console.log("페이지당 항목 수:", pageSize);
    setSelectedRowKeys([]);
  };

  // 행 선택 기능
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // 검색 필터 적용
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
          style={{ width: 400 }}
        />
      </div>
      <div className={styles.boardHeader}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            position: ["bottomCenter"],
            hideOnSinglePage: true,
            pageSizeOptions: ["5", "10", "20"],
            defaultPageSize: 10,
            onChange: handlePageChange,
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName={() => styles.tableRow}
        />
      </div>
    </div>
  );
};

export default BoardFreedom;
