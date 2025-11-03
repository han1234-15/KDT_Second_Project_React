import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Input } from "antd";
import { caxios } from "../../config/config";

const ranks = {
  J001: "사원",
  J002: "주임",
  J003: "대리",
  J004: "과장",
  J005: "차장",
  J006: "부장",
  J007: "이사",
  J008: "부사장",
  J009: "사장"
};

function LeaveStatus() {
  const [list, setList] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const leaveCodeMap = {
    half_pm: "반차(오후)",
    half_am: "반차(오전)",
    annual: "연차",
    sick: "병가",
  };

  const statusMap = {
    WAITING: "결재대기",
    APPROVED: "승인",
    REJECTED: "반려",
    CHECKING: "확인중",
    REFERENCE: "참조",
  };

  const normalizeLine = (list) =>
    (list || []).map((a) => ({
      id: String(a.ID || a.id),
      name: a.NAME || a.name,
      rank_code: a.RANK_CODE || a.rank_code,
      status: (a.STATUS || a.status || "").trim().toUpperCase(),
    }));

  const fetchData = async () => {
    const statusRes = await caxios.get("/leave/status");
    const meRes = await caxios.get("/member/me");
    const myId = String(meRes.data.id);
    setLoginUser({ ...meRes.data, id: myId });

    const withLines = await Promise.all(
      statusRes.data.map(async (row) => {
        if (!row.approvalId) return { ...row, approvalLine: [] };
        const lineRes = await caxios.get(`/Eapproval/line/${row.approvalId}`);
        return { ...row, approvalLine: normalizeLine(lineRes.data) };
      })
    );

    const filtered = withLines.filter((row) => {
      const isWriter = row.memberId === myId;
      const isApprover = row.approvalLine.some((a) => a.id === myId && a.status !== "REFERENCE");
      const isReference = row.approvalLine.some((a) => a.id === myId && a.status === "REFERENCE");
      return isWriter || isApprover || isReference;
    });

    setList(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (row) => {
    setSelectedRow({ ...row });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const approveHandler = () => {
    caxios.post(`/leave/approve`, { seq: selectedRow.seq }).then(() => {
      Modal.success({ content: "✅ 승인 완료!" });
      closeModal();
      fetchData();
    });
  };

  const rejectHandler = () => {
    if (!rejectReason.trim()) return Modal.warning({ content: "반려 사유를 입력하세요." });
    caxios.post(`/leave/reject`, { seq: selectedRow.seq, reason: rejectReason }).then(() => {
      Modal.error({ content: "❌ 반려 처리 완료" });
      closeModal();
      fetchData();
    });
  };

  // ✅ 여기 수정됨 (CHECKING 도 승인 가능하게)
  const isMyTurn = () => {
    if (!selectedRow || !loginUser) return false;

    const current = selectedRow.approvalLine.find(
      (a) =>
        (a.status === "WAITING" || a.status === "CHECKING") &&
        a.id === loginUser.id
    );

    return !!current;
  };

  const columns = [
    { title: "신청자", render: (r) => `${r.memberName} (${ranks[r.rankCode]})`, align: "center" },
    { title: "휴가종류", render: (r) => leaveCodeMap[r.leaveCode], align: "center" },
    { title: "기간", render: (r) => `${r.startLeaveTime?.slice(0,10)} ~ ${r.endLeaveTime?.slice(0,10)}`, align: "center" },
    { title: "사유", dataIndex: "reason", align: "center" },
    {
      title: "상태",
      align: "center",
      render: (row) => {
        const mine = row.approvalLine.find((a) => a.id === loginUser?.id);
        const status = (mine?.status || row.status).toUpperCase();
        return (
          <Tag
            color={
              status === "WAITING"
                ? "gold"
                : status === "APPROVED"
                ? "green"
                : status === "REJECTED"
                ? "red"
                : "blue"
            }
          >
            {statusMap[status]}
          </Tag>
        );
      },
    },
    { title: "상세", align: "center", render: (row) => <Button onClick={() => openModal(row)}>보기</Button> },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>휴가 현황</h2>
      <Table dataSource={list} columns={columns} rowKey="seq" bordered pagination={false} />
<Modal open={modalOpen} onCancel={closeModal} footer={null} centered width={550}>
  {selectedRow && (
    <>
      <h3>휴가 상세 내역</h3>

      <div style={{ marginTop: 10, marginBottom: 20 }}>
        <p><b>신청자:</b> {selectedRow.memberName} ({ranks[selectedRow.rankCode]})</p>
        <p><b>휴가 종류:</b> {leaveCodeMap[selectedRow.leaveCode]}</p>
        <p><b>기간:</b> {selectedRow.startLeaveTime?.slice(0,10)} ~ {selectedRow.endLeaveTime?.slice(0,10)}</p>
        <p><b>사유:</b> {selectedRow.reason || "-"}</p>
      </div>

      <b>결재선</b>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: 6 }}>결재자</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 6 }}>직급</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 6 }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {selectedRow.approvalLine
            .filter((a) => a.status !== "REFERENCE")
            .map((a) => (
              <tr key={a.id}>
                <td style={{ padding: 6 }}>{a.name}</td>
                <td style={{ padding: 6 }}>{ranks[a.rank_code]}</td>
                <td style={{ padding: 6 }}>{statusMap[a.status] || "-"}</td>
              </tr>
            ))}
        </tbody>
      </table>

         {selectedRow.approvalLine.some(a => a.status === "REFERENCE") && (
        <div style={{ marginTop: 20 }}>
          <b>참조자</b>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", padding: 6 }}>이름</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 6 }}>직급</th>
              </tr>
            </thead>
            <tbody>
              {selectedRow.approvalLine
                .filter((a) => a.status === "REFERENCE")
                .map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: 6 }}>{a.name}</td>
                    <td style={{ padding: 6 }}>{ranks[a.rank_code]}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ 반려 사유 표시 */}
      {selectedRow.rejectReason && (
        <div style={{ background: "#fff2f2", border: "1px solid #f5c2c2", padding: 12, borderRadius: 6, marginTop: 20 }}>
          <b style={{ color: "#d93025" }}>반려 사유</b>
          <p style={{ marginTop: 6 }}>{selectedRow.rejectReason}</p>
        </div>
      )}

      {/* ✅ 내가 결재할 차례일 때 버튼 표시 */}
      {isMyTurn() && (
        <div style={{ marginTop: 20 }}>
          <Button type="primary" block onClick={approveHandler}>✅ 승인</Button>
          <Input.TextArea
            style={{ marginTop: 12 }}
            rows={3}
            placeholder="반려 사유 입력"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Button danger block style={{ marginTop: 10 }} onClick={rejectHandler}>❌ 반려</Button>
        </div>
      )}
    </>
  )}
</Modal>
    </div>
  );
}

export default LeaveStatus;
