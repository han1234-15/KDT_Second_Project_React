import React, { useEffect, useState } from "react";
import { Table, Tag, Select } from "antd";
import { caxios } from "../../config/config";
import dayjs from "dayjs";
import styles from "./TaskResponsible.module.css";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const TaskResponsible = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    caxios
      .get("/task/assigned") // 담당자로 지정된 업무 목록 API
      .then((resp) => {
        console.log(resp.data);
        setTasks(resp.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 상태 컬럼 색상
  const renderStatusTag = (status) => {
    const color =
      status === "진행중"
        ? "blue"
        : status === "대기"
          ? "gray"
          : status === "완료"
            ? "green"
            : "default";
    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
    {
      title: "업무 그룹",
      dataIndex: "GROUP_NAME",
      key: "groupName",
      align: "center",
    },
    {
      title: "업무명",
      dataIndex: "TITLE",
      key: "taskName",
      align: "center",
    },
    {
      title: "생성자",
      dataIndex: "CREATED_NAME",
      key: "taskName",
      align: "center",
      render: (_, record) => `${record.CREATED_NAME} (${record.CREATED_ID})`,
    },
    {
      title: "상태",
      dataIndex: "STATUS",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),

      // 🔽 정렬 추가
      sorter: (a, b) => {
        const order = { 대기: 1, 진행중: 2, 완료: 3 };
        return order[a.STATUS] - order[b.STATUS];
      },
    },
    {
      title: "생성일시",
      dataIndex: "CREATED_AT",
      key: "createdAt",
      align: "center",
      render: (text) => dayjs(text).format("YYYY년 MM월 DD일 HH:mm"),
      sorter: (a, b) => dayjs(a.CREATED_AT).unix() - dayjs(b.CREATED_AT).unix(), // 날짜 정렬도 추가 가능
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>목록</h2>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="seq"
        bordered
        pagination={false}
        onRow={(record) => ({
          onClick: () => navigate(`/task/group/${record.GROUP_SEQ}`), // ✅ 클릭 시 상세 페이지 이동
        })}
        className={styles.clickableTable} // CSS로 hover 효과 줄 수 있음
      />
    </div>
  );
};

export default TaskResponsible;