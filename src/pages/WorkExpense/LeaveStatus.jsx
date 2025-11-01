import { useEffect, useState } from "react";
import { caxios } from "../../config/config";

// 직급 순서 (과장 이상 = 결재 가능)
const rankOrder = ["사원", "대리", "과장", "차장", "부장", "이사", "부사장", "사장"];

function LeaveStatus() {
  const [list, setList] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

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

  // ✅ 현재 결재 차례 담당자(첫 WAITING)
  const getCurrentApprover = () => {
    if (!selectedRow?.approvalLine) return null;
    const waiting = selectedRow.approvalLine.find(a => a.STATUS === "WAITING");
    return waiting ? waiting.ID : null;   // ✅ 여기 수정됨
  };

  // ✅ 과장 이상만 승인/반려 가능
  const isAdmin =
    loginUser &&
    rankOrder.indexOf(loginUser.rank_code) >= rankOrder.indexOf("과장");

  const formatDate = (str) => {
    if (!str) return "-";
    const d = new Date(str.replace(" ", "T"));
    if (isNaN(d)) return "-";
    return d.toISOString().split("T")[0];
  };

  const formatLeaveRange = (row) => {
    const date = formatDate(row.startLeaveTime);
    if (row.leaveCode === "half_am") return `${date} 09:00 ~ 12:00`;
    if (row.leaveCode === "half_pm") return `${date} 13:00 ~ 18:00`;
    return `${formatDate(row.startLeaveTime)} ~ ${formatDate(row.endLeaveTime)}`;
  };

  const fetchData = () => {
    caxios.get("/leave/status").then(res => setList(res.data));
  };

  useEffect(() => {
    fetchData();
    caxios.get("/member/me").then(res => setLoginUser(res.data));
  }, []);

  const approveHandler = () => {
    caxios.post(`/leave/approve`, { seq: selectedRow.seq }).then(() => {
      alert("승인 처리되었습니다 ✅");
      closeModal();
      fetchData();
    });
  };

  const rejectHandler = () => {
    if (!rejectReason.trim()) return alert("반려 사유를 입력하세요.");
    caxios.post(`/leave/reject`, { seq: selectedRow.seq, reason: rejectReason }).then(() => {
      alert("반려 처리되었습니다 ❌");
      closeModal();
      fetchData();
    });
  };

  const openModal = async (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);

    if (!row.approvalId) return;

    const res = await caxios.get(`/Eapproval/line/${row.approvalId}`);
    setSelectedRow(prev => ({
      ...prev,
      approvalLine: res.data
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setRejectReason("");
    setShowRejectInput(false);
  };

  // ✅ 참조자 여부 확인
  const isReferenceUser = () =>
    selectedRow?.approvalLine?.some(a => a.ID === loginUser?.id && a.STATUS === "REFERENCE");

  return (
    <div style={{ padding: "20px" }}>
      <h2>휴가 현황</h2>

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>신청자</th>
            <th>휴가종류</th>
            <th>기간</th>
            <th>사유</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {list.map(row => (
            <tr key={row.seq}>
              <td>{row.memberName} ({row.rankCode})</td>
              <td>{leaveCodeMap[row.leaveCode]}</td>
              <td>{formatLeaveRange(row)}</td>
              <td>{row.reason}</td>
              <td>{statusMap[row.status]}</td>
              <td>
                <button style={detailBtn} onClick={() => openModal(row)}>보기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedRow && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>휴가 상세</h3>

            <p><strong>신청자:</strong> {selectedRow.memberName} ({selectedRow.rankCode})</p>
            <p><strong>휴가종류:</strong> {leaveCodeMap[selectedRow.leaveCode]}</p>
            <p><strong>기간:</strong> {formatLeaveRange(selectedRow)}</p>
            <p><strong>사유:</strong> {selectedRow.reason}</p>
            <p><strong>상태:</strong> {statusMap[selectedRow.status]}</p>

            {/* 결재선 */}
            {selectedRow.approvalLine && (
              <>
                <strong>결재자</strong>
                <table style={lineTable}>
                  <tbody>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map(a =>
                        <td style={tdStyle} key={a.ID}>{a.NAME} ({a.RANK_CODE})</td>
                      )}
                    </tr>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map(a =>
                        <td style={tdStyle} key={a.ID}>{statusMap[a.STATUS] || "-"}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* 참조자 */}
            {selectedRow.approvalLine?.some(a => a.STATUS === "REFERENCE") && (
              <>
                <strong>참조자</strong>
                <table style={lineTable}>
                  <tbody>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS === "REFERENCE").map(a =>
                        <td style={tdStyle} key={a.ID}>{a.NAME} ({a.RANK_CODE})</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* ✅ 승인 / 반려 버튼 표시 조건 */}
            {isAdmin &&
              !isReferenceUser() &&
              getCurrentApprover() === loginUser?.id && (
                <>
                  <button onClick={approveHandler}>✅ 승인</button>
                  <button onClick={() => setShowRejectInput(true)}>❌ 반려</button>

                  {showRejectInput && (
                    <>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ width: "100%", marginTop: "10px" }}
                      />
                      <button onClick={rejectHandler}>반려 확정</button>
                    </>
                  )}
                </>
            )}

            <button onClick={closeModal} style={{ marginTop: "14px" }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

const detailBtn = {
  background: "linear-gradient(45deg, #00b4db, #0083b0)",
  border: "none",
  padding: "6px 14px",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
};

const modalBackdrop = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
};

const modalBox = {
  background: "white", padding: "20px", borderRadius: "8px", width: "420px",
};

const lineTable = {
  width: "100%", textAlign: "center", marginTop: "6px",
  borderCollapse: "collapse",
};

const tdStyle = {
  border: "1px solid #ccc", padding: "6px",
};

export default LeaveStatus;
