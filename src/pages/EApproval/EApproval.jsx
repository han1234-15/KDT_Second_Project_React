import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Empty } from "antd";
import { caxios } from "../../config/config";
import "./styles/ApprovalPage.css";

function EApproval() {
  const navigate = useNavigate();
  const { status = "show" } = useParams();
  const [docs, setDocs] = useState([]);

  const userId = sessionStorage.getItem("LoginID");
  const upperStatus = status.toUpperCase();

  // ✅ DB 상태값 → 화면 상태값 통일 함수
  const normalizeStatus = (raw) => {
  const s = (raw || "").toUpperCase();
  switch (s) {
    case "WAIT":
    case "N":
      return "WAITING";   // 승인대기
    case "P":
      return "PENDING";   // ✅ 예정
    case "PROCESSING":
      return "PROCESSING";
    case "APPROVED":
    case "Y":
      return "APPROVED";
    case "REJECTED":
    case "R":
      return "REJECTED";
    case "TEMP":
      return "TEMP";
    default:
      return "WAITING";
  }
};

  // ✅ 화면 표시 텍스트
  const statusMap = {
  WAITING: "승인 대기",
  PROCESSING: "결재 진행 중",
  PENDING: "예정",          // ✅ 추가
  APPROVED: "승인",
  REJECTED: "반려",

};

const statusColor = {
  "승인 대기": "gold",
  "결재 진행 중": "geekblue",
  "예정": "gray",           // ✅ 새로운 색 (원하면 바꿔도 됨)
  "승인": "green",
  "반려": "red",

};

  const renderStatusTag = (value) => {
    const text = statusMap[value] || value;
    const color = statusColor[text] || "blue";
    return <Tag color={color}>{text}</Tag>;
  };

  // ✅ 테이블 컬럼
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

  // ✅ 데이터 불러오기
  useEffect(() => {
  
  let url = "";

  switch (upperStatus) {
    case "WAIT":
  url = `/Eapproval/WAIT`; 
  break;

    case "PROCESSING": // ✅ 진행 중
      url = `/Eapproval/PROCESSING`;
      break;

    case "PENDING": // ✅ 예정 (내 차례 아직 X)
      url = `/Eapproval/my/scheduled?userId=${userId}`;
      break;

    case "APPROVED":
    case "REJECTED":
    case "TEMP":
      url = `/Eapproval/${upperStatus}`;
      break;

    default:
      url = `/Eapproval/A`;
  }

 caxios.get(url).then((res) => {
  setDocs(
    (res.data ?? []).map((doc) => ({
      ...doc,
      status: normalizeStatus(doc.myStatus || doc.status), // ✅ 여기서 myStatus 우선 반영
    }))
  );
});
}, [upperStatus, userId]);

  return (
    <div className="approval-container">
      <Table
        className="custom-table"
        dataSource={docs}
        columns={columns}
        rowKey="seq"
        pagination={false}
        bordered
        locale={{
          emptyText: (
            <Empty description="표시할 문서가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ),
        }}
      />
    </div>
  );
}

export default EApproval;
