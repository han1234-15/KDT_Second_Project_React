import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Empty } from "antd";   // ✅ Empty 추가
import { caxios } from "../../config/config";
import "./styles/ApprovalPage.css";

function EApproval() {
  const navigate = useNavigate();
  const { status = "show" } = useParams();
  const [docs, setDocs] = useState([]);

  const userId = sessionStorage.getItem("LoginID");
  const upperStatus = status.toUpperCase();

  const statusMap = {
    WAIT: "승인 대기",
    CHECKING: "진행 중",
    PROCESSING: "예정",
    APPROVED: "기안",
    REJECTED: "반려",
    TEMP: "임시 저장",
  };

  const renderStatusTag = (value) => {
    const text = statusMap[value] || value;
    const color = {
      "승인 대기": "gold",
      "진행 중": "geekblue",
      "예정": "cyan",
      "기안": "green",
      "반려": "red",
      "임시 저장": "gray",
    }[text];

    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    { title: "문서번호", dataIndex: "seq", align: "center", width: 100 },
    {
      title: "제목",
      dataIndex: "title",
      render: (text, record) => (
        <span
          className="title-link"
          onClick={() =>
            record.status === "TEMP"
              ? navigate(`/Eapproval/edit/${record.seq}`)
              : navigate(`/Eapproval/detail/${record.seq}`)
          }
        >
          {text}
        </span>
      ),
    },
    { title: "기안자", dataIndex: "writer", align: "center", width: 120 },
    {
      title: "기안일",
      dataIndex: "writeDate",
      align: "center",
      width: 200,
      render: (date) => new Date(date).toLocaleString("ko-KR"),
    },
    {
      title: "상태",
      dataIndex: "status",
      align: "center",
      width: 130,
      render: (value) => renderStatusTag(value),
    },
  ];

  useEffect(() => {
    let url = "";

    switch (upperStatus) {
      case "WAIT":
        url = `/Eapproval/my/wait?userId=${userId}`;
        break;
      case "PROCESSING":
        url = `/Eapproval/my/scheduled?userId=${userId}`;
        break;
      case "CHECKING":
        url = `/Eapproval/CHECKING`;
        break;
      case "APPROVED":
      case "REJECTED":
      case "TEMP":
        url = `/Eapproval/${upperStatus}`;
        break;
      default:
        url = `/Eapproval/A`;
    }

    caxios.get(url).then((res) => setDocs(res.data));
  }, [status, userId]);

  return (
    <div className="approval-container">
      <Table
        className="custom-table"
        dataSource={docs ?? []}             
        columns={columns}
        rowKey="seq"
        pagination={false}
        bordered
        locale={{
          emptyText: (
            <Empty
              description="No data"
              image={Empty.PRESENTED_IMAGE_SIMPLE}  
            />
          ),
        }}
      />
    </div>
  );
}

export default EApproval;
