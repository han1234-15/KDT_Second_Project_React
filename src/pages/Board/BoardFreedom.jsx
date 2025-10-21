import React, { useState } from "react";
import { Table, Input } from "antd";
import styles from "./BoardFreedom.module.css";
const { Search } = Input;

const BoardFreedom = () => {
  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // 더미 데이터
  const dataSource = Array.from({ length: 42 }, (_, i) => ({
    key: i,
    tag: "공지",
    title: `게시글 제목 ${i + 1}`,
    author: `작성자 ${i + 1}`,
    date: "2025-10-22",
  }));
    // 검색어 필터링
  const filteredData = dataSource.filter((item) =>
    item.title.includes(search)
  );

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
      <div className={styles.header}>
        {/* 페이지네이션 */}
        <Table
          rowSelection={rowSelection}
          dataSource={filteredData}
          columns={columns}
          pagination={{
            position: ["bottomCenter"],
            hideOnSinglePage: true,
            pageSizeOptions: ["5", "10", "20"],
            defaultPageSize: 10,
            onChange: handlePageChange,
          }}
        />
      </div>
    </div>
  );
};

export default BoardFreedom;
