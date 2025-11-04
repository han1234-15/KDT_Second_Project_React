import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Input } from "antd";
import { caxios } from "../../config/config";

function LeaveStatus() {
  const [list, setList] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const rankMap = {
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

  const leaveCodeMap = {
    half_pm: "반차(오후)",
    half_am: "반차(오전)",
    annual: "연차",
    sick: "병가",
  };

  const docStatusMap = {
    WAIT: "결재대기",
    PROCESSING: "진행중",
    APPROVED: "승인",
    REJECTED: "반려",
  };

  const lineStatusMap = {
    CHECKING: "진행중",
    WAITING: "대기",
    APPROVED: "승인",
    REJECTED: "반려",
    REFERENCE: "참조",
  };

  const fetchData = () => {
    caxios.get("/leave/status").then(res => setList(res.data));
  };

  useEffect(() => {
    fetchData();
    caxios.get("/member/me").then(res => setLoginUser(res.data));
  }, []);

  const formatDate = (str) => str ? new Date(str).toISOString().split("T")[0] : "-";

  const formatLeaveRange = (row) => {
    const date = formatDate(row.startLeaveTime);
    if (row.leaveCode === "half_am") return `${date} 09:00 ~ 12:00`;
    if (row.leaveCode === "half_pm") return `${date} 13:00 ~ 18:00`;
    return `${formatDate(row.startLeaveTime)} ~ ${formatDate(row.endLeaveTime)}`;
  };

  const openModal = async (row) => {
    const res = await caxios.get(`/Eapproval/doc/line/${row.approvalId}`);
    setSelectedRow({ ...row, approvalLine: res.data });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRejectReason("");
  };

  const approveHandler = async () => {
    await caxios.post(`/leave/approve`, { seq: selectedRow.seq });

    const res = await caxios.get(`/Eapproval/doc/line/${selectedRow.approvalId}`);
    setSelectedRow(prev => ({ ...prev, approvalLine: res.data }));

    Modal.success({ content: "✅ 승인 완료!" });
    closeModal();
    fetchData();
  };

 const rejectHandler = async () => {
  if (!rejectReason.trim())
    return Modal.warning({ content: "반려 사유를 입력하세요." });

 const approverId = loginUser.id; // ✅ 로그인한 결재자 ID

  await caxios.post(`/leave/reject`, { 
    seq: selectedRow.seq,
    approvalId: selectedRow.approvalId,
   approverId,                     // ✅ 추가 (핵심)
    reason: rejectReason 
  });

  const res = await caxios.get(`/Eapproval/doc/line/${selectedRow.approvalId}`);
  setSelectedRow(prev => ({ ...prev, approvalLine: res.data }));

  Modal.error({ content: "❌ 반려 처리 완료" });
  closeModal();
  fetchData();
};

  const getCurrentApprover = () => {
    if (!selectedRow?.approvalLine) return null;
    const current = selectedRow.approvalLine.find(a => a.STATUS === "CHECKING");
    return current?.ID ?? null;
  };

  const columns = [
    {
      title: "신청자",
      render: (row) => `${row.memberName} (${rankMap[row.rankCode]})`,
      align: "center",
    },
    { title: "휴가종류", dataIndex: "leaveCode", render: c => leaveCodeMap[c], align: "center" },
    { title: "기간", render: row => formatLeaveRange(row), align: "center" },
    { title: "사유", dataIndex: "reason", align: "center" },
    {
      title: "상태",
      dataIndex: "status",
      align: "center",
      render: (v) => (
        <Tag color={v === "WAIT" ? "gold" : v === "APPROVED" ? "green" : v === "REJECTED" ? "red" : "blue"}>
          {docStatusMap[v]}
        </Tag>
      ),
    },
    {
      title: "상세",
      align: "center",
      render: (row) => (
        <Button style={detailBtn} onClick={() => openModal(row)}>
          보기
        </Button>
      ),
    },
  ];

  const rejected = selectedRow?.approvalLine?.find(a => a.STATUS === "REJECTED");

  return (
    <div style={{ padding: "20px" }}>
      <h2>휴가 현황</h2>

      <Table dataSource={list} columns={columns} rowKey="seq" bordered pagination={false} />

      <Modal open={modalOpen} onCancel={closeModal} footer={null} width={520} centered>
        {selectedRow && (
          <>
             {console.log(selectedRow.approvalLine)}   
            <h3>휴가 상세</h3>

            <p><b>신청자:</b> {selectedRow.memberName} ({rankMap[selectedRow.rankCode]})</p>
            <p><b>휴가종류:</b> {leaveCodeMap[selectedRow.leaveCode]}</p>
            <p><b>기간:</b> {formatLeaveRange(selectedRow)}</p>
            <p><b>사유:</b> {selectedRow.reason}</p>

          

            <b>결재선</b>
            <table style={lineTable}>
              <tbody>
                <tr>
                  {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE")
                    .map(a => (
                      <td key={a.ID}>
                        {a.NAME} ({rankMap[a.RANK_CODE]})
                      </td>
                    ))}
                </tr>
                <tr>
                  {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE")
                    .map(a => (
                      <td key={a.ID}>{lineStatusMap[a.STATUS]}</td>
                    ))}
                </tr>
              </tbody>
            </table>

            {getCurrentApprover() === loginUser?.id && (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <Button type="primary" onClick={approveHandler}>✅ 승인</Button>
                <Input.TextArea
                  placeholder="반려 사유"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ marginTop: "10px" }}
                />
                <Button danger block style={{ marginTop: "8px" }} onClick={rejectHandler}>
                  ❌ 반려 확정
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

const detailBtn = {
  background: "linear-gradient(45deg, #00b4db, #0083b0)",
  border: "none",
  color: "white",
  borderRadius: "6px",
};

const lineTable = {
  width: "100%",
  textAlign: "center",
  marginTop: "6px",
  borderCollapse: "collapse",
};

export default LeaveStatus;
