import React, { useState } from "react";
import { Modal, Select, Input, message, Button } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ApprovalLineModal from "./ApprovalLineModal";
import { caxios } from "../../config/config";
import styles from "./style/LeaveModal.module.css";

const LeaveModal = ({ open, onClose, refresh, applicant }) => {
  const [vacType, setVacType] = useState("annual");
  const [vacReason, setVacReason] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const [approverList, setApproverList] = useState([]);
  const [referenceNames, setReferenceNames] = useState([]);

  const handleDateClick = (info) => {
    const date = info.dateStr;
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const selectedEvents = selectedDates.map((d) => ({
    title: "선택됨",
    start: d,
    allDay: true,
    display: "background",
    backgroundColor: "#82b1ff"
  }));

  const applyApprovalLine = ({ approverList, referenceNames }) => {
    setApproverList(approverList);
    setReferenceNames(referenceNames);
  };

  const submitVacation = async () => {
    if (!selectedDates.length) return message.error("날짜를 선택하세요.");
    if (!approverList.length) return message.warning("결재선을 설정하세요.");
    if ((vacType === "half_am" || vacType === "half_pm") && selectedDates.length !== 1)
      return message.warning("반차는 하루만 선택 가능합니다.");

    const payload = {
      items: selectedDates.map((d) => ({ date: d, type: vacType, reason: vacReason })),
      approvers: approverList,
      references: referenceNames
    };

    await caxios.post("/leave/request", payload);
    message.success("휴가 신청 완료");
    onClose();
    refresh();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="75%">
      {/* ✅ 결재선 UI 영역 */}
      <div className={styles.approvalTableBox}>
        <div className={styles.approvalTableTitle}>
          <span>결재선</span>
          <Button
            size="small"
            type="primary"
            onClick={() => setApprovalModalOpen(true)}
          >
            + 결재선 설정
          </Button>
        </div>

   <table className={styles.approvalTable}>
  <thead>
    <tr>
      {/* ✅ 결재자가 없으면 1열, 있으면 결재자 수 + 1열 */}
      <th style={{ width: 80 }}>구분</th>
      {approverList.length > 0 &&
        approverList.map((a, i) => (
          <th key={i}>{`${a.name} (${a.rank_code})`}</th>
        ))}
    </tr>
  </thead>

  <tbody>
    {/* ✅ 결재 Row */}
    <tr>
      <td className={styles.leftCol}>결재</td>

      {approverList.length > 0
        ? approverList.map((_, i) => <td key={i}>-</td>)
        : null}
    </tr>

    {/* ✅ 참조 Row (항상 마지막 1칸만 값 표시, 나머지는 빈칸) */}
    <tr>
      <td className={styles.leftCol}>참조</td>

      {approverList.length > 0 ? (
        <>
          {/* 값은 첫 번째 칸만 */}
          <td colSpan={approverList.length}>
            {referenceNames.length ? referenceNames.join(", ") : "없음"}
          </td>
        </>
      ) : (
        // 결재자가 없으면 1열에서만 출력
        <td>없음</td>
      )}
    </tr>
  </tbody>
</table>

      </div>

      {/* ✅ 선택 날짜 */}
      <div className={styles.selectedDateBox}>
        <strong>선택된 날짜: </strong>
        {selectedDates.length ? selectedDates.sort().join(", ") : "날짜를 선택하세요"}
      </div>

      {/* ✅ 캘린더 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={selectedEvents}
        height={450}
        locale="ko"
      />

      {/* ✅ 휴가 종류 & 사유 */}
      <div style={{ marginTop: 20 }}>
        <Select
          value={vacType}
          onChange={setVacType}
          style={{ width: "100%", marginBottom: 10 }}
          options={[
            { value: "annual", label: "연차" },
            { value: "half_am", label: "오전 반차" },
            { value: "half_pm", label: "오후 반차" },
            { value: "official", label: "공가" },
            { value: "family", label: "경조" },
            { value: "sick", label: "병가" },
            { value: "business_trip", label: "출장" }
          ]}
        />

        <Input.TextArea
          placeholder="사유 입력"
          value={vacReason}
          onChange={(e) => setVacReason(e.target.value)}
        />
      </div>

      {/* ✅ 신청 버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>취소</Button>
        <Button type="primary" onClick={submitVacation}>신청</Button>
      </div>

      {/* ✅ 결재선 모달 */}
      <ApprovalLineModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onApply={applyApprovalLine}
        initialApprovers={approverList}
        initialReferences={referenceNames}
        applicant={applicant}
      />
    </Modal>
  );
};

export default LeaveModal;
