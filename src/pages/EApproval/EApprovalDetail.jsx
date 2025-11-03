import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Input, Empty } from "antd";
import "./styles/ApprovalDetail.css";
import { caxios } from "../../config/config";

function EApprovalDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionTarget, setDecisionTarget] = useState(null);

  useEffect(() => {
    caxios.get("/member/me").then(res => setLoginUser(res.data));
  }, []);

  useEffect(() => {
    caxios.get(`/Eapproval/detail/${seq}`)
      .then((res) => setDoc(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          Modal.warning({ content: "⚠️ 이 문서를 볼 수 없습니다." });
          navigate(-1);
        } else Modal.error({ content: "문서를 불러오는 중 오류 발생" });
      });
  }, [seq]);

  if (!doc || !loginUser) return <div>📄 불러오는 중...</div>;

  const approvers = doc.approvers ?? [];

  // ✅ 현재 결재자 찾기
  const currentApprover = approvers
    .filter(a => a.orderNo !== null && (a.status === "N" || a.status == null))
    .sort((a, b) => a.orderNo - b.orderNo)[0];

  const isMyTurn = currentApprover?.id === loginUser.id;

  // ✅ 상태 셀 UI 처리
  const renderStatusCell = (a) => {
    const status = a.status || a.STATUS;

    if (
      doc.status !== "REJECTED" &&
      doc.status !== "APPROVED" &&
      (doc.status === "WAIT" || doc.status === "CHECKING") &&
      isMyTurn && a.id === loginUser.id
    ) {
      return (
        <Button
          type="primary"
          onClick={() => { setDecisionTarget(a); setShowDecisionModal(true); }}
        >
          결재
        </Button>
      );
    }

    return status === "Y" ? "✔ 승인" :
      status === "R" ? "✖ 반려" :
      "⏳ 대기";
  };

  // ✅ 테이블 컬럼
  const approverColumns = [
    { title: "이름", dataIndex: "name" },
    { title: "직급", dataIndex: "rank_code" },
    { title: "상태", render: (_, a) => renderStatusCell(a) }
  ];

  const referenceColumns = [
    { title: "이름", dataIndex: "name" },
    { title: "직급", dataIndex: "rank_code" }
  ];

  // ✅ 승인 / 반려 처리
  const handleApprove = () => {
    caxios.post("/Eapproval/approve", { seq: doc.seq, userId: loginUser.id })
      .then(() => { Modal.success({ content: "✅ 승인 완료" }); window.location.reload(); });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return Modal.warning({ content: "반려 사유를 입력하세요." });

    caxios.post("/Eapproval/reject", {
      seq: doc.seq, userId: loginUser.id, reason: rejectReason
    }).then(() => { Modal.error({ content: "❌ 반려 완료" }); window.location.reload(); });
  };

  return (
    <div className="approval-detail-container">
      <h2>문서 상세보기</h2>

      <h3>결재선</h3>
      <Table
        className="custom-table"
        dataSource={approvers}
        columns={approverColumns}
        rowKey="id"
        pagination={false}
        bordered
        rowClassName={(row) => row.id === currentApprover?.id ? "current-approver-row" : ""}
        locale={{ emptyText: <Empty description="No data" /> }}
      />

      <h3>참조</h3>
      <Table
        className="custom-table"
        dataSource={doc.referenceList || []}
        columns={referenceColumns}
        rowKey="id"
        pagination={false}
        bordered
        locale={{ emptyText: <Empty description="No data" /> }}
      />

      <h3>문서 정보</h3>
      <table className="detail-table">
        <tbody>
          <tr><th>문서번호</th><td>{doc.seq}</td></tr>
          <tr><th>제목</th><td>{doc.title}</td></tr>
          <tr><th>작성자</th><td>{doc.writer}</td></tr>
          <tr><th>작성일</th><td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td></tr>
          <tr><th>내용</th><td className="content">{doc.comments}</td></tr>
        </tbody>
      </table>

      {doc.status === "REJECTED" && (
        <div className="rejected-info">
          ❌ <strong>반려된 문서입니다.</strong>
          {doc.rejectReason && (
            <div className="reject-reason-box">
              <strong>반려 사유:</strong> {doc.rejectReason}
            </div>
          )}
        </div>
      )}

      <div className="button-area">
        <Button onClick={() => navigate(-1)}>← 목록으로</Button>
      </div>

      <Modal
        open={showDecisionModal}
        onCancel={() => setShowDecisionModal(false)}
        footer={null}
        centered
      >
        <h3><strong>{decisionTarget?.name}</strong> 님, 결재하시겠습니까?</h3>

        <Input.TextArea
          placeholder="반려 사유 입력 (반려 시 필수)"
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />

        <div className="action-buttons">
          <Button type="primary" onClick={handleApprove}>✅ 승인</Button>
          <Button danger onClick={handleReject}>❌ 반려</Button>
        </div>
      </Modal>
    </div>
  );
}

export default EApprovalDetail;
