import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Input } from "antd";
import { caxios } from "../../config/config";

const rankOrder = ["사원", "대리", "과장", "차장", "부장", "이사", "부사장", "사장"];

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
    const res = await caxios.get(`/Eapproval/line/${row.approvalId}`);
    setSelectedRow({ ...row, approvalLine: res.data });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRejectReason("");
  };

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

  const isAdmin =
    loginUser && rankOrder.indexOf(loginUser.rank_code) >= rankOrder.indexOf("과장");

  const getCurrentApprover = () =>
    selectedRow?.approvalLine?.find(a => a.STATUS === "WAITING")?.ID;

  const columns = [
    {
      title: "신청자",
      render: (row) => `${row.memberName} (${row.rankCode})`,
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
        <Tag color={
          v === "WAITING" ? "gold" :
          v === "APPROVED" ? "green" :
          v === "REJECTED" ? "red" :
          "blue"
        }>
          {statusMap[v]}
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>휴가 현황</h2>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="seq"
        bordered
        pagination={false}
        locale={{ emptyText: "표시할 휴가 내역이 없습니다." }}
      />

      <Modal open={modalOpen} onCancel={closeModal} footer={null} width={500} centered>
        {selectedRow && (
          <>
            <h3>휴가 상세</h3>
            <p><b>신청자:</b> {selectedRow.memberName} ({selectedRow.rankCode})</p>
            <p><b>휴가종류:</b> {leaveCodeMap[selectedRow.leaveCode]}</p>
            <p><b>기간:</b> {formatLeaveRange(selectedRow)}</p>
            <p><b>사유:</b> {selectedRow.reason}</p>

            {selectedRow.approvalLine && (
              <>
                <b>결재선</b>
                <table style={lineTable}>
                  <tbody>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map(a =>
                        <td key={a.ID}>{a.NAME} ({a.RANK_CODE})</td>
                      )}
                    </tr>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map(a =>
                        <td key={a.ID}>{statusMap[a.STATUS] || "-"}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* 승인/반려 버튼 조건 */}
            {isAdmin && getCurrentApprover() === loginUser?.id && (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <Button type="primary" onClick={approveHandler}>✅ 승인</Button>
                <Button danger style={{ marginLeft: "8px" }} onClick={() => {}}>
                  ❌ 반려
                </Button>
                <Input.TextArea
                  placeholder="반려 사유"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ marginTop: "10px" }}
                />
                <Button danger block style={{ marginTop: "8px" }} onClick={rejectHandler}>
                  반려 확정
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
