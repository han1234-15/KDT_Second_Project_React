import { useEffect, useState } from "react";
import { caxios } from "../../config/config";

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
    full: "연차",
    sick: "병가",
  };

  const statusMap = {
    WAIT: "결재대기",
    APPROVED: "승인",
    REJECTED: "반려",
    N: "대기중",
    Y: "사용완료",
  };

  // ✅ 관리자 조건 (사장, 부사장만)
  const isAdmin =
    loginUser?.rank_code === "사장" || loginUser?.rank_code === "부사장";

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  };

  const formatLeaveRange = (row) => {
    const date = formatDate(row.start_leave_time);
    if (row.leave_code === "half_am") return `${date} 09:00 ~ 12:00`;
    if (row.leave_code === "half_pm") return `${date} 13:00 ~ 18:00`;
    return `${formatDate(row.start_leave_time)} ~ ${formatDate(row.end_leave_time)}`;
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

    caxios.post(`/leave/reject`, { seq: selectedRow.seq, reason: rejectReason }).then(() => {
      alert("반려 처리되었습니다.");
      closeModal();
      fetchData();
    });
  };

  const openModal = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setRejectReason("");
    setShowRejectInput(false);
  };

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
          {list.map((row) => (
            <tr key={row.seq}>
              <td>{row.member_id}</td>
              <td>{leaveCodeMap[row.leave_code] || row.leave_code}</td>
              <td>{formatLeaveRange(row)}</td>
              <td>{row.reason}</td>
              <td>{statusMap[row.status]}</td>
              <td><button onClick={() => openModal(row)}>보기</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 모달 */}
      {isModalOpen && selectedRow && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>휴가 상세</h3>
            <p><strong>신청자:</strong> {selectedRow.member_id}</p>
            <p><strong>휴가종류:</strong> {leaveCodeMap[selectedRow.leave_code]}</p>
            <p><strong>기간:</strong> {formatLeaveRange(selectedRow)}</p>
            <p><strong>사유:</strong> {selectedRow.reason}</p>
            <p><strong>상태:</strong> {statusMap[selectedRow.status]}</p>

            {/* ✅ 사장/부사장 + WAIT 상태일 때만 노출 */}
         {isAdmin && selectedRow.status === "N" && selectedRow.member_id !== loginUser.id && (
  <>
    <button onClick={approveHandler}>승인</button>
    <button onClick={() => setShowRejectInput(true)}>반려</button> {/*반려*/}

    {showRejectInput && (
      <div style={{ marginTop: "10px" }}>
        <textarea
          placeholder="반려 사유 입력"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ width: "100%", height: "60px" }}
        ></textarea>
        <button onClick={rejectHandler} style={{ marginTop: "5px" }}>
          반려 확정
        </button>
      </div>
    )}
  </>
)}

            <button onClick={closeModal} style={{ marginTop: "10px" }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalBackdrop = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalBox = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "350px"
};

export default LeaveStatus;
