import React, { useEffect, useState } from "react";
import { Table, Tag, Select } from "antd";
import { caxios } from "../../config/config";
import dayjs from "dayjs";
import styles from "./TaskResponsible.module.css";

const { Option } = Select;

const TaskResponsible = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    caxios
      .get("/task/assigned") // 담당자로 지정된 업무 목록 API
      .then((resp) => {
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
      dataIndex: "groupName",
      key: "groupName",
      align: "center",
    },
    {
      title: "업무명",
      dataIndex: "taskName",
      key: "taskName",
      align: "center",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text, record) => (
        <Select
          defaultValue={record.status}
          style={{ width: 100 }}
          onChange={(value) => handleStatusChange(record.seq, value)}
        >
          <Option value="대기">대기</Option>
          <Option value="진행중">진행중</Option>
          <Option value="완료">완료</Option>
        </Select>
      ),
    },
    {
      title: "생성일시",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (text) => dayjs(text).format("YYYY년 MM월 DD일 HH:mm"),
    },
  ];

  // 상태 변경 핸들러
  const handleStatusChange = async (seq, value) => {
    try {
      await caxios.put(`/task/updateStatus/${seq}`, { status: value });
      setTasks((prev) =>
        prev.map((task) =>
          task.seq === seq ? { ...task, status: value } : task
        )
      );
    } catch (err) {
      console.error("상태 변경 실패:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>담당 업무 목록</h2>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="seq"
        bordered
        pagination={false}
      />
    </div>
  );
};

export default TaskResponsible;