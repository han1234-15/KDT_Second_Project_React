import { useEffect, useState } from "react";
import { caxios } from "../../config/config";

// 직급 순서
const rankOrder = ["사원", "대리", "과장", "차장", "부장", "이사", "부사장", "사장"];

function LeaveStatus() {
  const [list, setList] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);


  const getCurrentApprover = () => {
    if (!selectedRow?.approvalLine) return null;
    const waiting = selectedRow.approvalLine.find(a => a.STATUS === "WAITING");
    return waiting ? waiting.ID : null;
  };

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
    CHECKING: "확인중"
  };

  const isAdmin =
    loginUser &&
    rankOrder.indexOf(loginUser.rank_code) >= rankOrder.indexOf("과장");

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const validString = isoString.replace(" ", "T");
    const date = new Date(validString);
    if (isNaN(date)) return "-";
    return date.toISOString().split("T")[0];
  };

  const formatLeaveRange = (row) => {
    const date = formatDate(row.startLeaveTime);
    if (row.leaveCode === "half_am") return `${date} 09:00 ~ 12:00`;
    if (row.leaveCode === "half_pm") return `${date} 13:00 ~ 18:00`;
    return `${formatDate(row.startLeaveTime)} ~ ${formatDate(row.endLeaveTime)}`;
  };

  const fetchData = () => {
    caxios.get("/leave/status").then((res) => setList(res.data));
  };

  useEffect(() => {
    fetchData();
    caxios.get("/member/me").then((res) => setLoginUser(res.data));
  }, []);

  const approveHandler = () => {
    caxios.post(`/leave/approve`, { seq: selectedRow.seq }).then(() => {
      alert("승인 처리되었습니다.");
      closeModal();
      fetchData();
    });
  };

  const rejectHandler = () => {
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력하세요.");
      return;
    }

    caxios.post(`/leave/reject`, { seq: selectedRow.seq, reason: rejectReason })
      .then(() => {
        alert("반려 처리되었습니다.");
        closeModal();
        fetchData();
      });
  };

  const openModal = async (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);

    if (row.approvalId) {
      try {
        const res = await caxios.get(`/Eapproval/line/${row.approvalId}`);
        let lineData = res.data;
        if (lineData.approvers) lineData = lineData.approvers;

        setSelectedRow(prev => ({
          ...prev,
          approvalLine: lineData,
        }));

      } catch (err) {
        console.error("결재선 불러오기 실패:", err);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setRejectReason("");
    setShowRejectInput(false);
  };

  const isReferenceUser = () =>
    selectedRow?.approvalLine?.some(
      a => a.ID === loginUser?.id && a.STATUS === "REFERENCE"
    );

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
          {list.map((row, index) => (
            <tr key={`${row.seq}-${index}`}>
              <td>{row.memberName} ({row.rankCode})</td>
              <td>{leaveCodeMap[row.leaveCode?.toLowerCase()] || row.leaveCode}</td>
              <td>{formatLeaveRange(row)}</td>
              <td>{row.reason}</td>
              <td>{statusMap[row.status]}</td>
       <td>
  <button
    style={{
      background: "linear-gradient(45deg, #00b4db, #0083b0)",
      border: "none",
      padding: "6px 14px",
      borderRadius: "6px",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer"
    }}
    onClick={() => openModal(row)}
  >
    보기
  </button>
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

            {/* ✅ 결재자 테이블 */}
            {selectedRow.approvalLine && (
              <div style={{ marginTop: "10px" }}>
                <strong>결재자</strong>
                <table style={{ width: "100%", marginTop: "5px", textAlign: "center", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map((a, idx) => (
                        <td key={idx} style={tdStyle}>{a.NAME} ({a.RANK_CODE})</td>
                      ))}
                    </tr>
                  <tr>
          {selectedRow.approvalLine.filter(a => a.STATUS !== "REFERENCE").map((a, idx) => (
            <td key={idx} style={tdStyle}>
              {statusMap[a.STATUS] || "-"}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
)}

            {/* ✅ 참조자 테이블 */}
            {selectedRow.approvalLine?.some(a => a.STATUS === "REFERENCE") && (
              <div style={{ marginTop: "10px" }}>
                <strong>참조자</strong>
                <table style={{ width: "100%", marginTop: "5px", textAlign: "center", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      {selectedRow.approvalLine.filter(a => a.STATUS === "REFERENCE").map((a, idx) => (
                        <td key={idx} style={tdStyle}>{a.NAME} ({a.RANK_CODE})</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ✅ 참조자는 버튼 숨김 */}
            {isAdmin &&
              !isReferenceUser() &&
              (selectedRow.status === "WAITING" || selectedRow.status === "CHECKING") &&
              getCurrentApprover() === loginUser.id && (
                <>
                  <button onClick={approveHandler}>승인</button>
                  <button onClick={() => setShowRejectInput(true)}>반려</button>

                  {showRejectInput && (
                    <div style={{ marginTop: "10px" }}>
                      <textarea
                        placeholder="반려 사유 입력"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ width: "100%", height: "60px" }}
                      />
                      <button onClick={rejectHandler} style={{ marginTop: "5px" }}>반려 확정</button>
                    </div>
                  )}
                </>
              )}

            <button onClick={closeModal} style={{ marginTop: "10px" }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalBackdrop = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
};

const modalBox = {
  backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "420px",
};

const tdStyle = {
  border: "1px solid #ccc", padding: "6px",
};

export default LeaveStatus;
