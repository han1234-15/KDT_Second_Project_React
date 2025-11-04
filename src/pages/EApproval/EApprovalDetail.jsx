import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Input, Empty, Tag } from "antd";
import "./styles/ApprovalDetail.css";
import { caxios } from "../../config/config";

const rankNames = {
  J001: "사원",
  J002: "주임",
  J003: "대리",
  J004: "과장",
  J005: "차장",
  J006: "부장",
  J007: "이사",
  J008: "부사장",
  J009: "사장",
};

const convertStatus = (raw) => {
  const s = (raw || "").toUpperCase();
  switch (s) {
    case "PENDING": return "PENDING";
    case "APPROVED":
    case "Y": return "APPROVED";
    case "REJECTED":
    case "R": return "REJECTED";
    case "WAIT":
    case "N": return "WAITING";
    case "PROCESSING": return "PROCESSING";
    case "P": return "PENDING";
    default: return "WAITING";
  }
};

function EApprovalDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionTarget, setDecisionTarget] = useState(null);

  useEffect(() => {
    caxios.get("/member/me").then((res) => setLoginUser(res.data));
  }, []);

  useEffect(() => {
    caxios.get(`/Eapproval/detail/${seq}`)
      .then((res) => setDoc(res.data))
      .catch(() => {
        Modal.error({ content: "문서를 불러오는 중 오류 발생" });
        navigate(-1);
      });
  }, [seq]);

  if (!doc || !loginUser) return <div>📄 로딩중...</div>;

  const approvers = doc.approvers ?? [];
  const referenceList = doc.referenceList ?? [];

  const nextApprover = approvers
    .filter(a => a.orderNo != null && (a.status === "N" || a.status === "P"))
    .sort((a, b) => a.orderNo - b.orderNo)[0];

  const currentOrder = nextApprover?.orderNo;

  // ✅ 문서 상태로 버튼 노출 제어
  const isDocFinished = doc.status === "REJECTED" || doc.status === "APPROVED";

  const renderStatusCell = (approver) => {
    // ✅ 문서 종료 상태면 버튼 표시 X
    if (isDocFinished) {
      if (approver.status === "R") {
        return (
          <div style={{ textAlign: "center" }}>
            <Tag color="red">반려</Tag>
            {approver.rejectReason && (
              <div style={{ marginTop: 4, fontSize: 12, color: "#d9534f" }}>
                사유: {approver.rejectReason}
              </div>
            )}
          </div>
        );
      }
      if (approver.status === "Y") return <Tag color="green">승인</Tag>;
      return <Tag color="gray">종료</Tag>;
    }

    const st = approver.status;
    const reason = approver.rejectReason;
    const order = approver.orderNo;

    if (st === "Y") return <Tag color="green">승인</Tag>;

    if (st === "R") {
      return (
        <div style={{ textAlign: "center" }}>
          <Tag color="red">반려</Tag>
          {reason && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#d9534f" }}>
              사유: {reason}
            </div>
          )}
        </div>
      );
    }

    if ((st === "N" || st === "P") && order === currentOrder && approver.id === loginUser.id) {
      return (
        <Button type="primary" onClick={() => {
          setDecisionTarget(approver);
          setShowDecisionModal(true);
        }}>
          결재
        </Button>
      );
    }

    if (st === "N" || st === "P") return <Tag color="gold">대기</Tag>;
    return <Tag>-</Tag>;
  };

  const approverColumns = [
    { title: "이름", dataIndex: "name" },
    { title: "직급", dataIndex: "rank_code", render: (v) => rankNames[v] },
    { title: "상태", render: (_, a) => renderStatusCell(a) },
  ];

  const referenceColumns = [
    { title: "이름", dataIndex: "name" },
    { title: "직급", dataIndex: "rank_code", render: (v) => rankNames[v] },
  ];

  const handleApprove = () => {
    caxios.post("/Eapproval/approve", { seq: doc.seq, userId: loginUser.id })
      .then(() => {
        Modal.success({ content: "✅ 승인되었습니다." });
        window.location.reload();
      });
  };

  const handleReject = () => {
    if (!rejectReason.trim())
      return Modal.warning({ content: "반려 사유를 입력하세요." });

    caxios.post("/Eapproval/reject", {
      seq: doc.seq,
      userId: loginUser.id,
      reason: rejectReason,
    }).then(() => {
      Modal.error({ content: "❌ 문서가 반려되었습니다." });
      window.location.reload();
    });
  };

  return (
    <div className="approval-detail-container">
      <h2>
        문서 상세보기
        <Tag color={doc.status === "REJECTED" ? "red" : doc.status === "APPROVED" ? "green" : "blue"} style={{ marginLeft: 10 }}>
          {convertStatus(doc.myStatus || doc.status)}
        </Tag>
      </h2>

      <h3>결재선</h3>
      <Table
        dataSource={approvers}
        columns={approverColumns}
        rowKey="id"
        pagination={false}
        bordered
        locale={{ emptyText: <Empty description="없음" /> }}
      />

      <h3>참조자</h3>
      <Table
        dataSource={referenceList}
        columns={referenceColumns}
        rowKey="id"
        pagination={false}
        bordered
        locale={{ emptyText: <Empty description="없음" /> }}
      />

      <h3>문서 내용</h3>
      <table className="detail-table">
        <tbody>
          <tr><th>문서번호</th><td>{doc.seq}</td></tr>
          <tr><th>제목</th><td>{doc.title}</td></tr>
          <tr><th>작성자</th><td>{doc.writer}</td></tr>
          <tr><th>작성일</th><td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td></tr>
          <tr><th>내용</th><td className="content">{doc.comments}</td></tr>
        </tbody>
      </table>

      <div className="button-area">
        <Button onClick={() => navigate(-1)}>← 목록으로</Button>
      </div>

      <Modal open={showDecisionModal} onCancel={() => setShowDecisionModal(false)} footer={null} centered>
        <h3><strong>{decisionTarget?.name}</strong> 님 문서 처리</h3>

        <Input.TextArea
          placeholder="반려 시 사유를 입력해주세요."
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />

        <div className="action-buttons">
          <Button type="primary" onClick={handleApprove} disabled={isDocFinished}>✅ 승인</Button>
          <Button danger onClick={handleReject} disabled={isDocFinished}>❌ 반려</Button>
        </div>
      </Modal>
    </div>
  );
}

export default EApprovalDetail;
