import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import styles from "./BoardAnnouncement.module.css";
import { caxios } from "../../../config/config";
const { Search } = Input;

const BoardAnnouncement = () => {
  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const [data, setData] = useState([]);
  // 공지사항 (category_id = 1) 데이터 불러오기
  useEffect(() => {
    caxios
      .get("/board/1") // category_id = 1 (공지사항)
      .then((resp) => {
        console.log("게시글 목록:", resp.data);
        // 백엔드 응답 구조에 맞게 데이터 매핑
        const mapped = resp.data.map((item) => ({
          key: item.seq,
          tag: "공지", // 필요 시 카테고리명 표시
          title: item.title,
          author: item.writer_id,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));
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
        />
      </div>
    </div>
  );
};

export default BoardAnnouncement;
